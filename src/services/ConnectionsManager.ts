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
import { Injectable } from "@aczwink/acts-util-node";
import { MachineContext } from "../model/MachineContext";
import { LocalhostMachineConnection } from "../LocalhostMachineConnection";
import { MachineConnection } from "../model/MachineConnection";
import { DistroInfoService } from "./DistroInfoService";
import { Distribution } from "../model/Distribution";
import { SSHConnection } from "../SSHConnection";

@Injectable
export class ConnectionsManager
{
    constructor(private distroInfoService: DistroInfoService)
    {
    }

    public async CreateConnectionToLocalhost()
    {
        return await this.BuildContext(new LocalhostMachineConnection);
    }

    public async CreateSSHConnection(config: { host: string; userName: string; password: string; })
    {
        const conn = new ssh2.Client();

        await new Promise<void>( (resolve, reject) => {
            conn.on("error", reject);
            conn.on("ready", resolve).connect({
                host: config.host,
                username: config.userName,
                password: config.password
            });
        });

        return this.BuildContext(new SSHConnection(conn, config.password));
    }

    //Private methods
    private async BuildContext(connection: MachineConnection): Promise<MachineContext>
    {
        return {
            distribution: await this.FetchDistribution(connection),
            ExecuteCommand: connection.ExecuteCommand.bind(connection)
        };
    }

    private async FetchDistribution(connection: MachineConnection): Promise<Distribution>
    {
        const id = await this.distroInfoService.FetchId(connection);
        switch(id)
        {
            case "arch":
                return Distribution.Arch;
            case "debian":
                return Distribution.Debian;
            case "ubuntu":
                return Distribution.Ubuntu;
        }

        throw new Error("Distribution not supported: " + id);
    }
}