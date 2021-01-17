// type ConnectionTimeout = {
//   timeout?: number;
// };

// export type DirectConnectionWithProfile = ConnectionTimeout & {
//   mode: "direct";
//   profile: string;
//   region: string;
// };

// export type DirectConnectionWithCredentials = ConnectionTimeout & {
//   mode: "direct";
//   accessKeyId: string;
//   secretAccessKey: string;
//   region: string;
// };

// type DirectConnection =
//   | DirectConnectionWithProfile
//   | DirectConnectionWithCredentials;

// type LocalConnection = ConnectionTimeout & {
//   mode: "local";
//   accessKeyId?: string;
//   secretAccessKey?: string;
//   host?: string;
//   port?: number;
//   profile?: string;
// };

// export type DynatronConnectionParameters = DirectConnection | LocalConnection;
