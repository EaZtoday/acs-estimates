export interface CustomerCharacteristicConfig {
  id: string;
  name: string;
  created_at: string;
}

export interface CustomerCharacteristics {
  [key: string]: boolean;
}

export interface CustomerCharacteristicFormData {
  name: string;
}
