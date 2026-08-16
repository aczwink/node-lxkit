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
import { GlobalInjector, Injectable } from "@aczwink/acts-util-node";
import { MachineContext } from "../model/MachineContext";
import { Distribution } from "../model/Distribution";
import { DebianPackageManager } from "../distros/debian/DebianPackageManager";
import { DistroPackageManager } from "../distros/DistroPackageManager";

@Injectable
export class PackageManager
{
    public async InstallPackages(connection: MachineContext, packageNames: string[])
    {
        const distroPackageManager = this.ResolveDistroPackageManager(connection);
        await distroPackageManager.InstallPackages(connection, packageNames);
    }

    public async IsPackageInstalled(connection: MachineContext, packageName: string)
    {
        const distroPackageManager = this.ResolveDistroPackageManager(connection);
        return await distroPackageManager.IsPackageInstalled(connection, packageName);
    }

    public async UninstallPackages(connection: MachineContext, packageNames: string[])
    {
        const distroPackageManager = this.ResolveDistroPackageManager(connection);
        await distroPackageManager.UninstallPackages(connection, packageNames);
    }

    //Private methods
    private ResolveDistroPackageManager(connection: MachineContext): DistroPackageManager
    {
        switch(connection.distribution)
        {
            case Distribution.Arch:
                throw new Error("Method not implemented.");
            case Distribution.Debian:
            case Distribution.Ubuntu:
                return GlobalInjector.Resolve(DebianPackageManager);
        }
    }
}