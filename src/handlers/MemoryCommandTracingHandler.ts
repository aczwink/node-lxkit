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
import { Dictionary } from "@aczwink/acts-util-core";
import { CommandTracer, CommandTracingHandler } from "../model/CommandTracingHandler";

enum Status
{
    Running = 0,
    Finished = 1,
    Failed = 2
}

class CommandTracerImpl implements CommandTracer
{
    constructor(private finalizer: () => void)
    {
        this.entries = [];
        this._status = Status.Running;
    }

    public AddStdErr(...text: string[]): void
    {
        this.entries.push({
            text: text.join(" "),
            timeStamp: new Date(),
            stdOut: false
        });
    }

    public AddStdOut(...text: string[]): void
    {
        this.entries.push({
            text: text.join(" "),
            timeStamp: new Date(),
            stdOut: true
        });
    }

    public Finish(exitCode: number): void
    {
        this._status = Status.Finished;
        this.finalizer();
    }

    //State
    private entries: { timeStamp: Date; text: string; stdOut: boolean; }[];
    private _status: Status;
}

export class MemoryCommandTracingHandler implements CommandTracingHandler
{
    constructor()
    {
        this.tracerCounter = 0;
        this.tracers = {};
    }

    //Public methods
    public CreateTracer(cmdLine: string): CommandTracer
    {
        const id = this.tracerCounter++;

        const tracer = new CommandTracerImpl(this.OnTrackerFinished.bind(this, id));

        return tracer;
    }

    //Event handlers
    private OnTrackerFinished(trackerId: number)
    {
        setTimeout(() => {
            delete this.tracers[trackerId];
        }, 60 * 60 * 1000);
    }

    //State
    private tracerCounter: number;
    private tracers: Dictionary<CommandTracer>;
}