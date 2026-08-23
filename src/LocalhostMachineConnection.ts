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
import child_process from "child_process";
import { CommandExecutionArgs, MachineConnection } from "./model/MachineConnection";

export class LocalhostMachineConnection implements MachineConnection
{
    //Public methods
    public Close(): void
    {
    }
    
    public async ExecuteCommand(command: string[], args: CommandExecutionArgs)
    {
        const childProcess = this.CreateChildProcess(command);

        if(args.onNewStdErrData !== undefined)
            childProcess.stderr.on("data", args.onNewStdErrData);
        if(args.onNewStdOutData !== undefined)
            childProcess.stdout.on("data", args.onNewStdOutData);

        const exitCode = await this.ChildProcessToPromise(childProcess);

        return exitCode;
    }

    //Private methods
    private ChildProcessToPromise(childProcess: child_process.ChildProcessWithoutNullStreams)
    {
        return new Promise<number>( (resolve, reject) => {
            childProcess.on("close", (code, _) => resolve(code!));
            childProcess.on("error", reject);
        });
    }

    private CreateChildProcess(command: string[])
    {
        const commandLine = command.join(" ");
        const childProcess = child_process.spawn(commandLine, [], {
            //cwd: workingDirectory,
            //env: options.environmentVariables,
            //gid: auth.gid,
            shell: true,
            //uid: auth.uid,
        });

        /*if(sudo)
        {
            childProcess.stdin.setDefaultEncoding("utf-8");
            childProcess.stdin.write(this.sessionManager.password + "\n");
        }*/

        //this.processTracker.RegisterProcess(childProcess, commandLine);

        return childProcess;
    }
}