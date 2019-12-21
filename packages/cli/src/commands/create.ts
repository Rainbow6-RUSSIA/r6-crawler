import { Command, command, option, Options, param, params } from 'clime';
import concat from 'concat-stream';
import ProxyAgent from 'https-proxy-agent';
import fetch from 'node-fetch';
import * as PPT from 'puppeteer';

export class ExtraOptions extends Options {
    @option({
        name: 'use-proxies',
        description: 'Use proxies',
        toggle: true,
        default: false
    })
    public useProxies: boolean;

    @option({
        name: 'test-proxies',
        description: 'Test proxies',
        toggle: true,
        default: false
    })
    public checkProxies: boolean;

    @option({
        name: 'timeout',
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
        // process.exit(0);
        // return 'Hello, Clime!';
    }

    public static async regAccoutn(proxy: string) {
        const browser = await PPT.launch({
            args: [
                `--proxy-server=""`
            ],
            defaultViewport: {
                width: 800,
                height: 600,
            },
        });
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
