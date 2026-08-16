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

export type Command = string[] | {
    type: "redirect-stdout" | "pipe",
    sudo?: boolean;
    source: Command;
    target: Command;
};

@Injectable
export class CommandService
{
    public CommandToString(command: Command): { commandLine: string; sudo: boolean }
    {
        function EscapeArg(part: string)
        {
            if(part.includes(" "))
            {
                if(part.startsWith('"') && part.endsWith('"'))
                {
                    //TODO: handle case where this includes another unescaped double quote
                }
                else if(part.startsWith("'") && part.endsWith("'"))
                {
                    //TODO: is this case safe?
                    return part;
                }
                else if(part.includes('"'))
                    return part.ReplaceAll(" ", "\\ ");
                return '"' + part.ReplaceAll('"', '\\"') + '"';
            }

            return part;
        }
        function AddSudoArgsIfRequired(command: string[])
        {
            if(command[0] === "sudo")
            {
                return "sudo --stdin -k " + command.slice(1).map(EscapeArg).join(" ");
            }
            return command.map(EscapeArg).join(" ");
        }

        if(Array.isArray(command))
        {
            return {
                commandLine: AddSudoArgsIfRequired(command),
                sudo: command[0] === "sudo"
            };
        }

        let op;
        switch(command.type)
        {
            case "pipe":
                op = "|";
                break;
            case "redirect-stdout":
                op = ">";
                break;
        }

        const nested = this.CommandToString(command.source).commandLine + " " + op + " " + this.CommandToString(command.target).commandLine;

        return {
            commandLine: (command.sudo === true ? "sudo --stdin sh -c '" + nested + "'" : nested),
            sudo: command.sudo === true
        };
    }
}