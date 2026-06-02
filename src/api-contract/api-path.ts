export const ApiPath = {
  ['/meta']: '/meta',
  ['/help']: '/help',
  ['/action']: '/action',
  ['/logs']: '/logs',
  ['/state']: '/state',
  ['/snapshot']: '/snapshot',
} as const

export type ApiPathKey = keyof typeof ApiPath

export function toContractPath<T extends ApiPathKey>(key: T): (typeof ApiPath)[T] {
  return ApiPath[key]
}
