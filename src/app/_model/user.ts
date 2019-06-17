export class User {

  constructor(username: string, password: string, email: string) {
    this.username = username;
    this.password = password;
    this.email = email;
  }

  id: number;
  username: string;
  password: string;
  email: string;
  token: string;
}