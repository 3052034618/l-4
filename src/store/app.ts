import { create } from 'zustand';
import Taro from '@tarojs/taro';
import { Voyage, Message, VoyageStatus, MessageType } from '@/types';
import { mockVoyages } from '@/data/voyage';
import { mockMessages } from '@/data/message';

const VOYAGES_STORAGE_KEY = 'water_transport_voyages';
const MESSAGES_STORAGE_KEY = 'water_transport_messages';
const SHIPS_STORAGE_KEY = 'water_transport_ships';

interface AppState {
  voyages: Voyage[];
  messages: Message[];
  
  initFromStorage: () => void;
  
  addVoyage: (voyage: Omit<Voyage, 'id' | 'progress' | 'status'>) => void;
  updateVoyage: (id: string, updates: Partial<Voyage>) => void;
  getVoyageById: (id: string) => Voyage | undefined;
  
  updateVoyageStatus: (id: string, status: VoyageStatus, actualTime?: string) => void;
  updateVoyageProgress: (id: string, progress: number) => void;
  updateVoyageEta: (id: string, newEta: string, reason?: string) => void;
  reportDelay: (id: string, reason: string, newEta: string) => void;
  addDocument: (voyageId: string, docUrl: string) => void;
  
  addMessage: (message: Omit<Message, 'id' | 'sendTime' | 'isRead'>) => void;
  markMessageRead: (id: string) => void;
  confirmMessage: (id: string) => void;
  getUnreadCount: () => number;
}

const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

const getCurrentTime = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

const useAppStore = create<AppState>((set, get) => ({
  voyages: [],
  messages: [],
  
  initFromStorage: () => {
    try {
      const storedVoyages = Taro.getStorageSync(VOYAGES_STORAGE_KEY);
      const storedMessages = Taro.getStorageSync(MESSAGES_STORAGE_KEY);
      
      if (storedVoyages && storedVoyages.length > 0) {
        set({ voyages: storedVoyages });
      } else {
        set({ voyages: mockVoyages });
        Taro.setStorageSync(VOYAGES_STORAGE_KEY, mockVoyages);
      }
      
      if (storedMessages && storedMessages.length > 0) {
        set({ messages: storedMessages });
      } else {
        set({ messages: mockMessages });
        Taro.setStorageSync(MESSAGES_STORAGE_KEY, mockMessages);
      }
    } catch (e) {
      console.error('[Store] Init from storage failed:', e);
      set({ voyages: mockVoyages, messages: mockMessages });
    }
  },
  
  addVoyage: (voyageData) => {
    const newVoyage: Voyage = {
      id: generateId(),
      voyageNo: `NH${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(get().voyages.length + 1).padStart(3, '0')}`,
      status: 'pending',
      progress: 0,
      ...voyageData
    };
    
    const newVoyages = [newVoyage, ...get().voyages];
    set({ voyages: newVoyages });
    Taro.setStorageSync(VOYAGES_STORAGE_KEY, newVoyages);
    
    const newMessage: Omit<Message, 'id' | 'sendTime' | 'isRead'> = {
      type: 'notice',
      title: '新航次创建',
      content: `航次 ${newVoyage.voyageNo} 已创建，船舶：${newVoyage.shipName}，船长：${newVoyage.captain}`,
      voyageId: newVoyage.id,
      voyageNo: newVoyage.voyageNo,
      sender: '调度中心',
      needConfirm: false
    };
    get().addMessage(newMessage);
    
    return newVoyage;
  },
  
  updateVoyage: (id, updates) => {
    const newVoyages = get().voyages.map(v => 
      v.id === id ? { ...v, ...updates } : v
    );
    set({ voyages: newVoyages });
    Taro.setStorageSync(VOYAGES_STORAGE_KEY, newVoyages);
  },
  
  getVoyageById: (id) => {
    return get().voyages.find(v => v.id === id);
  },
  
  updateVoyageStatus: (id, status, actualTime) => {
    const voyage = get().getVoyageById(id);
    if (!voyage) return;
    
    const updates: Partial<Voyage> = { status };
    
    if (status === 'sailing' && actualTime) {
      updates.actualDeparture = actualTime;
      updates.progress = 30;
    } else if (status === 'loading') {
      updates.progress = 15;
    } else if (status === 'unloading') {
      updates.progress = 85;
    } else if (status === 'completed') {
      if (actualTime) updates.actualArrival = actualTime;
      updates.progress = 100;
    }
    
    get().updateVoyage(id, updates);
    
    const statusTextMap: Record<VoyageStatus, string> = {
      pending: '待执行',
      loading: '装货中',
      sailing: '已开航',
      unloading: '卸货中',
      completed: '已完成',
      delayed: '延误'
    };
    
    const newMessage: Omit<Message, 'id' | 'sendTime' | 'isRead'> = {
      type: status === 'delayed' ? 'delay' : 'notice',
      title: `航次状态更新 - ${statusTextMap[status]}`,
      content: `航次 ${voyage.voyageNo} 状态更新为「${statusTextMap[status]}」`,
      voyageId: id,
      voyageNo: voyage.voyageNo,
      sender: `船长-${voyage.captain}`,
      needConfirm: true
    };
    get().addMessage(newMessage);
  },
  
  updateVoyageProgress: (id, progress) => {
    get().updateVoyage(id, { progress });
  },
  
  updateVoyageEta: (id, newEta, reason) => {
    const voyage = get().getVoyageById(id);
    if (!voyage) return;
    
    get().updateVoyage(id, { plannedArrival: newEta });
    
    const newMessage: Omit<Message, 'id' | 'sendTime' | 'isRead'> = {
      type: 'change',
      title: '航次改期通知',
      content: reason 
        ? `航次 ${voyage.voyageNo} 预计到港时间调整为 ${newEta}，原因：${reason}`
        : `航次 ${voyage.voyageNo} 预计到港时间调整为 ${newEta}`,
      voyageId: id,
      voyageNo: voyage.voyageNo,
      sender: '调度中心',
      needConfirm: true
    };
    get().addMessage(newMessage);
  },
  
  reportDelay: (id, reason, newEta) => {
    const voyage = get().getVoyageById(id);
    if (!voyage) return;
    
    get().updateVoyage(id, { 
      status: 'delayed',
      plannedArrival: newEta
    });
    
    const newMessage: Omit<Message, 'id' | 'sendTime' | 'isRead'> = {
      type: 'delay',
      title: '异常延误上报',
      content: `航次 ${voyage.voyageNo} 上报异常延误，原因：${reason}，预计到达时间调整为 ${newEta}`,
      voyageId: id,
      voyageNo: voyage.voyageNo,
      sender: `船长-${voyage.captain}`,
      needConfirm: true
    };
    get().addMessage(newMessage);
  },
  
  addDocument: (voyageId, docUrl) => {
    const voyage = get().getVoyageById(voyageId);
    if (!voyage) return;
    
    const documents = voyage.documents ? [...voyage.documents, docUrl] : [docUrl];
    get().updateVoyage(voyageId, { documents });
    
    const newMessage: Omit<Message, 'id' | 'sendTime' | 'isRead'> = {
      type: 'document',
      title: '单据上传通知',
      content: `航次 ${voyage.voyageNo} 上传了新的单据照片`,
      voyageId,
      voyageNo: voyage.voyageNo,
      sender: `船长-${voyage.captain}`,
      needConfirm: true
    };
    get().addMessage(newMessage);
  },
  
  addMessage: (messageData) => {
    const newMessage: Message = {
      id: generateId(),
      sendTime: getCurrentTime(),
      isRead: false,
      ...messageData
    };
    
    const newMessages = [newMessage, ...get().messages];
    set({ messages: newMessages });
    Taro.setStorageSync(MESSAGES_STORAGE_KEY, newMessages);
  },
  
  markMessageRead: (id) => {
    const newMessages = get().messages.map(m => 
      m.id === id ? { ...m, isRead: true } : m
    );
    set({ messages: newMessages });
    Taro.setStorageSync(MESSAGES_STORAGE_KEY, newMessages);
  },
  
  confirmMessage: (id) => {
    const newMessages = get().messages.map(m => 
      m.id === id ? { ...m, isRead: true, isConfirmed: true } : m
    );
    set({ messages: newMessages });
    Taro.setStorageSync(MESSAGES_STORAGE_KEY, newMessages);
  },
  
  getUnreadCount: () => {
    return get().messages.filter(m => !m.isRead).length;
  }
}));

export default useAppStore;
