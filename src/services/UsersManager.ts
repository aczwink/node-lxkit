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
import { CommandExecutor } from "./CommandExecutor";
import { MachineConnection } from "../model/MachineConnection";

@Injectable
export class UsersManager
{
    constructor(private commandExecutor: CommandExecutor)
    {
    }

    //Public methods
    public async CreateUser(connection: MachineConnection, uid: number, linuxUserName: string)
    {
        await this.commandExecutor.ExecuteCommand(connection, "sudo", "useradd", "-M", "-u", uid.toString(), /*"-g", primaryLinuxGroupName,*/ linuxUserName);
    }

    public async DeleteUser(connection: MachineConnection, linuxUserName: string)
    {
        await this.commandExecutor.ExecuteCommand(connection, "sudo", "userdel", linuxUserName);
    }

    public async QueryUserId(connection: MachineConnection, linuxUserName: string)
    {
        const result = await this.commandExecutor.ExecuteBufferedCommand(connection, "id", "-u", linuxUserName);
        const uid = parseInt(result.stdOut);
        /*if(isNaN(uid))
            return undefined;*/
        if(result.exitCode === 1)
            return undefined;
        return uid;
    }
}