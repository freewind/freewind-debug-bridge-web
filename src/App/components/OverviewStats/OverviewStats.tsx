import { Card, Flex, Statistic } from 'antd'
import type { HelpResponse } from '../../../api-spec'

type Props = {
  help: HelpResponse | null
}

export function OverviewStats({ help }: Props) {
  return (
    <Flex gap={8} wrap>
      <Card size="small" style={{ flex: '1 1 160px', minWidth: 150 }}>
        <Statistic title="Action Targets" value={help?.counts.actionTargetCount ?? 0} />
      </Card>
      <Card size="small" style={{ flex: '1 1 160px', minWidth: 150 }}>
        <Statistic title="Logs" value={help?.counts.logCount ?? 0} />
      </Card>
      <Card size="small" style={{ flex: '1 1 160px', minWidth: 150 }}>
        <Statistic title="State Keys" value={help?.counts.stateKeyCount ?? 0} />
      </Card>
      <Card size="small" style={{ flex: '1 1 160px', minWidth: 150 }}>
        <Statistic title="Snapshot Nodes" value={help?.counts.snapshotNodeCount ?? 0} />
      </Card>
    </Flex>
  )
}
