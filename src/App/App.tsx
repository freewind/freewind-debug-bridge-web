import { useTitle } from 'ahooks'
import { Divider, Layout, Space, Tabs, Typography } from 'antd'
import type { FC } from 'react'
import {
  APIHeader,
  ActionTab,
  HelpTab,
  LogsTab,
  OverviewStats,
  RefreshToolbar,
  SnapshotTab,
  StateTab,
} from './components'
import { AppStoreProvider, useAppStore } from './store'

const AppContent: FC = () => {
  const consoleTitle = useAppStore((store) => store.help?.consoleTitle)
  const metaAppName = useAppStore((store) => store.meta?.appName)

  useTitle(metaAppName ? `${metaAppName} Debug Console` : consoleTitle || 'Freewind Debug Console')

  return (
    <Layout>
      <APIHeader />
      <Layout.Content style={{ padding: 12 }}>
        <Space direction="vertical" size={8} style={{ display: 'flex' }}>
          <RefreshToolbar />
          <OverviewStats />
          <Tabs
            size="small"
            items={[
              {
                key: 'logs',
                label: 'Logs',
                children: <LogsTab />,
              },
              {
                key: 'action',
                label: 'Action',
                children: <ActionTab />,
              },
              {
                key: 'state',
                label: 'State',
                children: <StateTab />,
              },
              {
                key: 'snapshot',
                label: 'Snapshot',
                children: <SnapshotTab />,
              },
              {
                key: 'help',
                label: 'Help',
                children: <HelpTab />,
              },
            ]}
          />
          <Divider />
          <Typography.Text type="secondary">
            Standalone console for Android / Swift debug bridge.
          </Typography.Text>
        </Space>
      </Layout.Content>
    </Layout>
  )
}

export const App: FC = () => {
  return (
    <AppStoreProvider>
      <AppContent />
    </AppStoreProvider>
  )
}
