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
import { Injectable } from "@aczwink/acts-util-node";
import { CommandExecutionArgs, MachineConnection } from "../model/MachineConnection";
import { CommandService } from "./CommandService";
import { CommandTracingManager } from "./CommandTracingManager";

export interface CommandExecutionResult
{
    exitCode: number;
    stdOut: string;
    stdErr: string;
}

@Injectable
export class CommandExecutor
{
    constructor(private commandTracingManager: CommandTracingManager, private commandService: CommandService)
    {
    }

    public async ExecuteBufferedCommand(connection: MachineConnection, ...command: string[]): Promise<CommandExecutionResult>
    {
        let stdOut = "";
        let stdErr = "";

        const code = await this.ExecuteCommandImpl(connection, command, {
            onNewStdErrData: chunk => stdErr += chunk,
            onNewStdOutData: chunk => stdOut += chunk,
        });

        return {
            exitCode: code,
            stdErr,
            stdOut
        };
    }

    public async ExecuteCommand(connection: MachineConnection, ...command: string[])
    {
        await this.ExecuteCommandImpl(connection, command, { expectedExitCode: 0 });
    }

    //Private methods
    private async ExecuteCommandImpl(connection: MachineConnection, command: string[], args: CommandExecutionArgs & { expectedExitCode?: number })
    {
        const tracer = this.commandTracingManager.activeHandler.CreateTracer(this.commandService.CommandToString(command).commandLine);
        
        const origStdErrHandler = args.onNewStdErrData;
        args.onNewStdErrData = data => {
            tracer.AddStdErr(data);
            if(origStdErrHandler !== undefined)
                origStdErrHandler(data);
        };
        
        const origStdOutHandler = args.onNewStdOutData;
        args.onNewStdOutData = data => {
            tracer.AddStdOut(data);
            if(origStdOutHandler !== undefined)
                origStdOutHandler(data);
        };
        
        const exitCode = await connection.ExecuteCommand(command, args);
        tracer.Finish(exitCode);

        if((args.expectedExitCode !== undefined) && (exitCode !== 0))
            throw new Error("Command '" + command.join(" ") + "' failed.");

        return exitCode;
    }
}