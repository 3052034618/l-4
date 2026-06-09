export type ShipStatus = 'idle' | 'sailing' | 'docked';

export type VoyageStatus = 'pending' | 'loading' | 'sailing' | 'unloading' | 'completed' | 'delayed';

export type MessageType = 'notice' | 'change' | 'delay' | 'expense' | 'document';

export interface Ship {
  id: string;
  name: string;
  imo: string;
  captain: string;
  capacity: number;
  status: ShipStatus;
  currentPort: string;
  nextPort?: string;
  eta?: string;
}

export interface Cargo {
  id: string;
  name: string;
  weight: number;
  unit: string;
  loadingPort: string;
  unloadingPort: string;
  plannedTime: string;
  consignor: string;
  status: 'pending' | 'assigned' | 'loading' | 'transit' | 'unloaded';
}

export interface Port {
  id: string;
  name: string;
  code: string;
  province: string;
  docks: number;
  availableDocks: number;
  waitShips: number;
  description: string;
}

export interface ConfirmRecord {
  id: string;
  messageId: string;
  type: MessageType;
  title: string;
  confirmer: string;
  confirmTime: string;
  remark?: string;
}

export interface Voyage {
  id: string;
  voyageNo: string;
  shipId: string;
  shipName: string;
  captain: string;
  cargoId: string;
  cargoName: string;
  cargoWeight: number;
  loadingPort: string;
  unloadingPort: string;
  plannedDeparture: string;
  plannedArrival: string;
  actualDeparture?: string;
  actualArrival?: string;
  status: VoyageStatus;
  progress: number;
  expense?: string;
  documents?: string[];
  delayReason?: string;
  newEta?: string;
  confirmRecords?: ConfirmRecord[];
}

export interface Message {
  id: string;
  type: MessageType;
  title: string;
  content: string;
  voyageId?: string;
  voyageNo?: string;
  sender: string;
  sendTime: string;
  isRead: boolean;
  needConfirm: boolean;
  isConfirmed?: boolean;
  confirmer?: string;
  confirmTime?: string;
}

export const shipStatusMap: Record<ShipStatus, { label: string; color: string; bgColor: string }> = {
  idle: { label: '空载', color: '#86909c', bgColor: '#f2f3f5' },
  sailing: { label: '在航', color: '#00b42a', bgColor: '#f0fff4' },
  docked: { label: '靠泊', color: '#ff7d00', bgColor: '#fff7e6' }
};

export const voyageStatusMap: Record<VoyageStatus, { label: string; color: string; bgColor: string }> = {
  pending: { label: '待执行', color: '#86909c', bgColor: '#f2f3f5' },
  loading: { label: '装货中', color: '#ff7d00', bgColor: '#fff7e6' },
  sailing: { label: '在航', color: '#00b42a', bgColor: '#f0fff4' },
  unloading: { label: '卸货中', color: '#ff7d00', bgColor: '#fff7e6' },
  completed: { label: '已完成', color: '#00b42a', bgColor: '#f0fff4' },
  delayed: { label: '延误', color: '#f53f3f', bgColor: '#fff1f0' }
};

export const messageTypeMap: Record<MessageType, { label: string; color: string; bgColor: string }> = {
  notice: { label: '通知', color: '#1677ff', bgColor: '#e6f4ff' },
  change: { label: '改港改期', color: '#ff7d00', bgColor: '#fff7e6' },
  delay: { label: '延误', color: '#f53f3f', bgColor: '#fff1f0' },
  expense: { label: '费用', color: '#722ed1', bgColor: '#f9f0ff' },
  document: { label: '单据', color: '#1677ff', bgColor: '#e6f4ff' }
};
