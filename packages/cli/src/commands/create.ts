import { Command, command, option, Options, param, params } from 'clime';
import concat from 'concat-stream';
import DropMail from 'dropmail';
import ProxyAgent from 'https-proxy-agent';
import fetch from 'node-fetch';

export class ExtraOptions extends Options {
    @option({
        name: 'use-proxies',
        description: 'Use proxies',
        toggle: true,
        default: false
    })
    public useProxies: boolean;

    @option({
        name: 'ping-proxies',
        description: 'Test proxies',
        toggle: true,
        default: false
    })
    public checkProxies: boolean;

    @option({
        name: 'ping-timeout',
        description: 'Check timeout',
        type: Number,
        default: 30000
    })
    public checkTimeout: number;

    @option({
        name: 'pipe',
        description: 'Supply proxies via pipe',
        toggle: true,
        default: false
    })
    public usePipe: boolean;

    // You can also create methods and properties.
    // get timeoutInSeconds(): number {
    //   return this.timeout / 1000;
    // }
}

@command({
    description: 'Creates N Ubisoft accounts'
})
export default class Create extends Command {
    public dropmail: DropMail;
    public proxies: string[];

    public async execute(
        @param({
        required: true,
        description: 'Number of accounts',
        type: Number,
        })
        n: number,

        options: ExtraOptions,
    ) {
        console.log(n, options);
        let proxies = options.useProxies && options.usePipe ? await Create.asyncStdIn(process.stdin) : [];
        if (options.checkProxies) {
            const testProxy = await Promise.all(proxies.map(proxy =>
                Promise.race([
                    Create.checkProxy(proxy),
                    Create.asyncTimeout(options.checkTimeout)
                ])
            ));
            proxies = proxies.filter((p, i) => testProxy[i]);
        }
        console.log(proxies);
        this.proxies = proxies;
        this.dropmail = new DropMail();

        this.dropmail.on('ready', this.handleReady);
        this.dropmail.on('email', this.handleMail);

        // this.regAccount(proxies[0]);
        // process.exit(0);
        // return 'Hello, Clime!';
    }

    public handleReady() {

    }

    public handleMail() {

    }

    public async regAccount(proxy: string) {
        const agent = new ProxyAgent('http://' + proxy);
        const body = JSON.stringify({
            email: 'jmeoltzb@laste.ml',
            confirmedEmail: 'jmeoltzb@laste.ml',
            dateOfBirth: '1950-03-16T00:00:00.00000Z',
            isDateOfBirthApprox: false,
            age: null,
            legalOptinsKey: 'cnUtUlV8MnwyMDE5LTEyLTIyVDAwOjI4OjEzLjAxMHwwfDJ8Mg==',
            firstName: null,
            lastName: null,
            nameOnPlatform: 'jmeoltzb',
            password: 'xolbyizfX1',
            country: 'RU',
            communicationThirdPartyOptIn: false,
            communicationOptin: true,
            preferredLanguage: 'en'
        });
        fetch('https://public-ubiservices.ubi.com/v3/users/validatecreation', {
            agent,
            timeout: 3000,
            method: 'post',
            body,
        });
        fetch('https://public-ubiservices.ubi.com/v3/users', {
            agent,
            timeout: 3000,
            method: 'post',
            body,
        });
        /*
         * {
            to_mail_orig: 'xonupfoh@10mail.org',
            to_mail: 'xonupfoh@10mail.org',
            text_source: 'html',
            text: 'Simple Transactional Email\n' +
                '  \n' +
                ' https://www.ubisoft.com\n' +
                ' Hi,\n' +
                ' Welcome to Ubisoft. For your account security please [verify your email address](https://account-uplay.ubi.com/en-GB/action/email-updated?genomeid=314d4fef-e568-454a-ae06-43e3bece12a6&strLogin=xonupfoh&strEmail=xonupfoh%4010mail.org&strStamp=F608556DB3780BD8690A052688C0D29806DF963E5DEC8E79230D04D8C0A7CC473403DEDB02F9B78274472A0072C47C7AC2304B41663178507BC1687913228E00) . \n' +
                ' You now have access to a rich set of services including:\n' +
                ' Online services in your games Exclusive rewards and benefits from the [Ubisoft Club](http://club.ubisoft.com) Discounts and promotions from our  [Shop](http://shop.ubi.com) Ubisoft forums and community sites The Uplay PC client with dedicated services to PC players Ubisoft Customer Support\n' +
                ' To change your password or update your account, visit the [account management website](https://account-uplay.ubi.com/en-GB/security-settings) .\n' +
                ' You can modify your subscription options from commercial newsletters at any time by visiting the [account management website](https://account-uplay.ubi.com/en-GB/account-information) .\n' +
                ' Cheers,\n' +
                ' Ubisoft\n' +
                ' “©2019 Ubisoft Entertainment. All rights reserved. Ubisoft and the Ubisoft logo are trademarks of Ubisoft Entertainment in the U.S. and/or other countries.\n' +
                ' UBISOFT ENTERTAINMENT S.A., a société anonyme incorporated under the laws of France having its registered office at 107 Avenue Henri Freville, BP 1070, 35207 Rennes, France”\t  ',
            subject: 'Welcome to Ubisoft',
            ref: 'ielro03sam5956h6d0hve79qv63rn1kq',
            received: '2019-12-22T14:25:46Z',
            has_html: true,
            from_mail: 'AccountSupport@ubi.com',
            from_hdr: '"Ubisoft Account Support" <AccountSupport@ubi.com>',
            decode_status: 0,
            attached: []
            }
         */
        // https://public-ubiservices.ubi.com/v3/users/validatecreation
        // https://public-ubiservices.ubi.com/v3/users
        return 'Hello, Clime!';
    }

    public static async checkProxy(proxy: string) {
        try {
            const res = await fetch(
                'http://connectivitycheck.gstatic.com/generate_204',
                { agent: new ProxyAgent('http://' + proxy), timeout: 3000 }
            );
            return res.status === 204;
        } catch (error) {
            return false;
        }
    }

    public static asyncStdIn = async (stdin: NodeJS.ReadStream) => {
            const buf = await new Promise<Buffer>((resolve, reject) => stdin.pipe(concat(resolve)));
            return buf.toString('utf8').split(/\r?\n/);
    }

    public static asyncTimeout = (time: number) => new Promise<boolean>(resolve => setTimeout(() => resolve(false), time));

}
