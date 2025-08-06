// Interface untuk Category
export interface Category {
  id: number | string;
  name: string;
  description: string;
  created_at: string;
}

// Interface untuk Channel
export interface Channel {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

// Interface untuk Template
export interface Template {
  id: number;
  category_id: number;
  channel_id: number;
  template_name: string;
  subject: string;
  body: string;
  has_attachment: boolean;
  created_at: string;
  category?: Category;
  channel?: Channel;
}

// Interface untuk User
export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
}

// Interface untuk Payment Method
export interface PaymentMethod {
  id: number;
  name: string;
  provider: string;
  image_url: string;
  created_at: string;
  updated_at: string | null;
}

// Interface untuk Response dari API
export interface TemplateResponse {
  status: string;
  message: string;
  data: Template;
}

// Type untuk Mock Data
export interface MockData {
  categories: Category[];
  channels: Channel[];
  templates: Template[];
  users: User[];
  payment: PaymentMethod[];
}

// Legacy interfaces untuk backward compatibility
export interface NotificationTemplate {
  id: number | string;
  template_name: string;
  subject: string;
  body: string;
  channel: string; // channel.name
  category: string; // category.name
  has_attachment: boolean;
  created_at: string;
}

export interface NotificationChannel {
  id: number | string;
  name: string;
  description?: string;
  created_at?: string;
}
