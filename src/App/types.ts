import type { ActionCatalogResponse } from '../api-spec'

export type ActionDescriptorView =
  ActionCatalogResponse['items'][number]['actions'][number] & {
    targetId: string
    targetType: string
    screen: string
  }

export type ManualActionFormValues = {
  targetId?: string
  action?: string
  source?: string
  text?: string
  dx?: number | null
  dy?: number | null
  argValues?: Record<string, string>
}
