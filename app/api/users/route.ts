import { NextResponse } from "next/server";


export async function GET(){
    const users = [
          {id:1,name:"Seemab"},
    {id:2,name:"John"},
    {id:3,name:"Alica"}
    ]

    return NextResponse.json(users);
}