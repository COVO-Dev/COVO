import * as bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';


export async function hash_password(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
}


export async function compare_password(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
}
