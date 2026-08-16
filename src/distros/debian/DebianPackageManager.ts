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
import { DistroPackageManager } from "../DistroPackageManager";
import { MachineContext } from "../../model/MachineContext";
import { CommandExecutor } from "../../services/CommandExecutor";

@Injectable
export class DebianPackageManager implements DistroPackageManager
{
    constructor(private commandExecutor: CommandExecutor)
    {
    }
    
    public async InstallPackages(ctx: MachineContext, packageNames: string[]): Promise<void>
    {
        await this.commandExecutor.ExecuteCommand(ctx, "sudo", "apt-get", "update");
        await this.commandExecutor.ExecuteCommand(ctx, "sudo", "apt", "-y", "install", ...packageNames);
    }

    public async IsPackageInstalled(connection: MachineContext, packageName: string): Promise<boolean>
    {
        const installedPackages = await this.FetchInstalledPackages(connection);

        return await this.CheckIfPackageIsInstalled(connection, installedPackages, packageName, new Set())
    }

    public async UninstallPackages(ctx: MachineContext, packageNames: string[]): Promise<void>
    {
        await this.commandExecutor.ExecuteCommand(ctx, "sudo", "DEBIAN_FRONTEND=noninteractive", "apt", "-y", "purge", ...packageNames);
        await this.commandExecutor.ExecuteCommand(ctx, "sudo", "apt", "-y", "autoremove");
    }

    //Private methods
    private async CheckIfPackageIsInstalled(ctx: MachineContext, installedPackages: string[], packageName: string, uninstalled: Set<string>): Promise<boolean>
    {
        if(installedPackages.Contains(packageName))
            return true;
        
        if(uninstalled.has(packageName)) //prevent cycles. For example btrfs-progs causes this
            return false;
        uninstalled.add(packageName);

        //check if it is a virtual package
        const result = await this.commandExecutor.ExecuteBufferedCommand(ctx, "apt-cache", "showpkg", packageName);
        const literal = "Reverse Provides:";
        const pos = result.stdOut.indexOf(literal) + literal.length;
        const reverseProvidesPart = result.stdOut.substring(pos).trimStart().split("\n");
        const providers = [];
        for (const line of reverseProvidesPart)
        {
            providers.push(line.split(" ")[0]!);
        }
        const childrenResults = await providers.Values().Distinct(x => x).Filter(x => x.length > 0).Map(x => this.CheckIfPackageIsInstalled(ctx, installedPackages, x, uninstalled)).PromiseAll();

        return childrenResults.Values().Filter(x => x).Any();
    }

    private async FetchInstalledPackages(ctx: MachineContext)
    {
        const aptResult = await this.commandExecutor.ExecuteBufferedCommand(ctx, "apt", "list", "--installed");
        const lines = aptResult.stdOut.split("\n");

        const result = [];
        for (let index = 0; index < lines.length; index++)
        {
            const line = lines[index]!;
            const parts = line.split("/");
            if(parts.length > 0)
                result.push(parts[0]!.trim());
        }
        return result;
    }
}