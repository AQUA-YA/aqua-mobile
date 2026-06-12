import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type {
  CompositeScreenProps,
  NavigatorScreenParams,
} from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type AuthStackParamList = {
  Login: undefined;
  RegisterEmail: undefined;
  VerifyCode: { email: string };
  SetPassword: { email: string; code: string };
  ForgotPassword: undefined;
  ResetPassword: { email: string };
  CompleteProfile: undefined;
};

export type ConsumerTabParamList = {
  Home: undefined;
  Orders: undefined;
  Wallet: undefined;
  Profile: undefined;
};

export type PurifierTabParamList = {
  PurifierDashboard: undefined;
  PurifierOrders: undefined;
  Business: undefined;
  PurifierWallet: undefined;
  PurifierProfile: undefined;
};

export type DeliveryTabParamList = {
  Available: undefined;
  Active: undefined;
  DeliveryHistory: undefined;
  DeliveryWallet: undefined;
  DeliveryProfile: undefined;
};

export type AdminTabParamList = {
  AdminDashboard: undefined;
  AdminUsers: undefined;
  AdminPurifiers: undefined;
  AdminOrders: undefined;
  AdminCatalogs: undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Consumer: NavigatorScreenParams<ConsumerTabParamList>;
  Purifier: NavigatorScreenParams<PurifierTabParamList>;
  Delivery: NavigatorScreenParams<DeliveryTabParamList>;
  Admin: NavigatorScreenParams<AdminTabParamList>;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export type AuthScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

export type ConsumerScreenProps<T extends keyof ConsumerTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<ConsumerTabParamList, T>,
    NativeStackScreenProps<RootStackParamList>
  >;

export type PurifierScreenProps<T extends keyof PurifierTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<PurifierTabParamList, T>,
    NativeStackScreenProps<RootStackParamList>
  >;

export type DeliveryScreenProps<T extends keyof DeliveryTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<DeliveryTabParamList, T>,
    NativeStackScreenProps<RootStackParamList>
  >;

export type AdminScreenProps<T extends keyof AdminTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<AdminTabParamList, T>,
    NativeStackScreenProps<RootStackParamList>
  >;
