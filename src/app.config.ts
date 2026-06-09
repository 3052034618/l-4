export default defineAppConfig({
  pages: [
    'pages/dashboard/index',
    'pages/voyage-list/index',
    'pages/ship-status/index',
    'pages/message-confirm/index',
    'pages/cargo-consignment/index',
    'pages/port-nodes/index',
    'pages/voyage-detail/index',
    'pages/create-voyage/index',
    'pages/transport-card/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTitleText: '水路运输调度',
    navigationBarTextStyle: 'black',
    backgroundColor: '#f5f7fa'
  },
  tabBar: {
    color: '#86909c',
    selectedColor: '#1677ff',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/dashboard/index',
        text: '调度看板'
      },
      {
        pagePath: 'pages/voyage-list/index',
        text: '航次列表'
      },
      {
        pagePath: 'pages/ship-status/index',
        text: '船舶状态'
      },
      {
        pagePath: 'pages/message-confirm/index',
        text: '消息确认'
      },
      {
        pagePath: 'pages/port-nodes/index',
        text: '港口节点'
      }
    ]
  }
})
