/**
 * node-lxkit
 * Copyright (C) 2026 Amir Czwink (amir130@hotmail.de)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * */
import ssh2 from "ssh2";
import { CommandExecutionArgs, MachineConnection } from "./model/MachineConnection";
import { GlobalInjector } from "@aczwink/acts-util-node";
import { CommandService } from "./services/CommandService";

export class SSHConnection implements MachineConnection
{
    constructor(private conn: ssh2.Client, private password: string)
    {
    }

    //Public methods
    public Close(): void
    {
        this.conn.end();
    }

    public async ExecuteCommand(command: string[], args: CommandExecutionArgs)
    {
        const cmdSvc = GlobalInjector.Resolve(CommandService);
        const cmd = cmdSvc.CommandToString(command);

        const channel = await this.ExecuteInteractiveCommand(cmd.commandLine, cmd.sudo);

        if(args.stdin !== undefined)
            channel.stdin.write(args.stdin);

        const exitCode = await new Promise<number>( (resolve, reject) => {

            if(args.onNewStdErrData !== undefined)
            {
                channel.stderr.setEncoding("utf-8");
                channel.stderr.on("data", args.onNewStdErrData);
            }
            if(args.onNewStdOutData !== undefined)
            {
                channel.stdout.setEncoding("utf-8");
                channel.stdout.on("data", args.onNewStdOutData);
            }
            
            this.RegisterExitEvents(channel, resolve, reject);
        });

        return exitCode;
    }

    //Private methods
    private async ExecuteInteractiveCommand(commandLine: string, asRoot?: boolean): Promise<ssh2.ClientChannel>
    {
        const channel = await new Promise<ssh2.ClientChannel>( (resolve, reject) => {
            this.conn.exec(commandLine, {
                //pty: hasSudo
            }, (err, channel) => {

                if(err)
                    reject(err);
                else
                    resolve(channel);
            });
        });

        if(asRoot === true)
            channel.stdin.write(this.password + "\n");

        return channel;
    }

    private RegisterExitEvents(channel: ssh2.ClientChannel, resolve: (value: number) => void, reject: (reason: any) => void)
    {
        channel.on("error", reject);
        channel.on("exit", code => resolve(code));
        channel.on("close", (code: any, signal: any) => resolve(code));
    }
}