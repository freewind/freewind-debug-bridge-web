export const commonSelectProps = {
  popupMatchSelectWidth: false,
  optionFilterProp: 'label' as const,
  showSearch: true,
  size: 'small' as const,
  style: { width: '100%' },
}

export const triStateOptions = [
  { label: 'true', value: 'true' },
  { label: 'false', value: 'false' },
]

export const stateScopeOptions = [
  { label: 'app', value: 'app' },
  { label: 'target', value: 'target' },
  { label: 'branch', value: 'branch' },
]

export const snapshotScopeOptions = [
  { label: 'self', value: 'self' },
  { label: 'branchToRoot', value: 'branchToRoot' },
  { label: 'subtree', value: 'subtree' },
]
