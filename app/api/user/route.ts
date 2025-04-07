import { NextRequest, NextResponse } from "next/server";
import {PrismaClient} from '@prisma/client'
export async function POST(req:NextRequest,res:NextResponse){
   const {user} =await req.json();
  const client = new PrismaClient();
  console.log("user",user);
  const email = user.user?.emailAddresses
  const userExists = await client.user.findUnique({where:{
   email: email[email.length-1]
  }
  });
  if(userExists){
   return NextResponse.json({mes:"User already exist"})
  }else{
  await client.user.create({
      data:{
         id: user.user?.id,
         name:user. user?.fullName,
         email:user.user?.emailAddresses,
         password:user.user?.passwordEnabled,
        image:user.user?.imageUrl,
         

      }
   })
  }
}