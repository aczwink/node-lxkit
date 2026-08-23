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
export class AURPackageManager implements DistroPackageManager
{
    constructor(private commandExecutor: CommandExecutor)
    {
    }

    //Public methods
    public async InstallPackages(ctx: MachineContext, packageNames: string[]): Promise<void>
    {
        await this.commandExecutor.ExecuteCommand(ctx, "yay", "--noconfirm", "-S", ...packageNames);
    }

    public async IsPackageInstalled(ctx: MachineContext, packageName: string): Promise<boolean>
    {
        throw new Error("Method not implemented.");
    }

    public UninstallPackages(ctx: MachineContext, packageNames: string[]): Promise<void>
    {
        throw new Error("Method not implemented.");
    }

    public async UpgradeAllInstalledPackages(ctx: MachineContext): Promise<void>
    {
        throw new Error("Method not implemented.");
    }
}