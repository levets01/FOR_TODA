declare module 'bcrypt' {
  export function hash(plain: string, saltOrRounds: string | number): Promise<string>;
  export function compare(plain: string, hash: string): Promise<boolean>;
}
