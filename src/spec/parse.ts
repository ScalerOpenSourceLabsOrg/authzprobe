import SwaggerParser from '@apidevtools/swagger-parser';
import type { HttpMethod, SpecOperation } from '../types.js';

const HTTP_METHODS: HttpMethod[] = [
  'get',
  'put',
  'post',
  'delete',
  'patch',
  'head',
  'options',
  'trace',
];

const SAFE_METHODS: ReadonlySet<HttpMethod> = new Set<HttpMethod>(['get', 'head']);

/**
 * Parse and fully dereference an OpenAPI document, returning a flat list of
 * operations that AuthzProbe knows how to probe.
 *
 * We deliberately keep the returned shape tiny and framework-free so the rest
 * of the engine never has to touch the sprawling OpenAPI object model.
 */
export async function parseSpec(specPath: string): Promise<SpecOperation[]> {
  // `dereference` resolves all $ref pointers so parameters are always inline.
  const api = (await SwaggerParser.dereference(specPath)) as any;

  if (!api.paths || typeof api.paths !== 'object') {
    throw new Error(`Spec "${specPath}" has no paths object — nothing to probe.`);
  }

  // A security requirement declared at the document root applies to every
  // operation unless the operation overrides it.
  const globalSecurity: boolean = Array.isArray(api.security) && api.security.length > 0;

  const operations: SpecOperation[] = [];

  for (const [path, pathItem] of Object.entries<any>(api.paths)) {
    if (!pathItem || typeof pathItem !== 'object') continue;

    // Parameters can be declared once at the path level and inherited by every
    // operation under that path.
    const pathLevelParams: any[] = Array.isArray(pathItem.parameters)
      ? pathItem.parameters
      : [];

    for (const method of HTTP_METHODS) {
      const op = pathItem[method];
      if (!op || typeof op !== 'object') continue;

      const params = [...pathLevelParams, ...(Array.isArray(op.parameters) ? op.parameters : [])];

      const pathParams = params
        .filter((p) => p && p.in === 'path' && typeof p.name === 'string')
        .map((p) => p.name as string);

      const queryParams = params
        .filter((p) => p && p.in === 'query' && typeof p.name === 'string')
        .map((p) => p.name as string);

      const hasSecurity =
        (Array.isArray(op.security) && op.security.length > 0) ||
        (op.security === undefined && globalSecurity);

      operations.push({
        operationId: typeof op.operationId === 'string' ? op.operationId : undefined,
        method,
        path,
        summary: typeof op.summary === 'string' ? op.summary : undefined,
        pathParams: dedupe(pathParams),
        queryParams: dedupe(queryParams),
        hasSecurity,
        isSafe: SAFE_METHODS.has(method),
      });
    }
  }

  if (operations.length === 0) {
    throw new Error(`Spec "${specPath}" declares no operations.`);
  }

  return operations;
}

function dedupe(values: string[]): string[] {
  return [...new Set(values)];
}
