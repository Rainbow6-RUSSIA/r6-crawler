import { EventEmitter } from "events";
import WebSocket from 'ws'

declare module DropMail {
    export class DM extends EventEmitter {
        constructor(domain?: string);
        public address: EmailAddress;
        public forward(to: string, locale?: string): Promise<any>;
        public close(): void;

        public on(event: 'ready' | 'address', listener: (address: EmailAddress) => void): this;
        public on(event: 'email', listener: (email: IEmail) => void): this;
        public on(event: 'domains', listener: (domains: string[]) => void): this;
    }

    export class EmailAddress {
        constructor(address: string, hash: string, client: WebSocket);
        public address: string;
        public hash: string;
        public client: WebSocket;
        public json(): Omit<EmailAddress, 'json'>;
    }

    export interface IEmail {
        to_mail_orig: string,
        to_mail: string,
        text_source: string,
        text: string,
        subject: string,
        ref: string,
        received: string,
        has_html: boolean;
        from_mail: string,
        from_hdr: string,
        decode_status: number;
        attached: IAttachment[]
    }

    export interface IAttachment {
        size: number;
        name: string;
    }
}

export = DropMail.DM