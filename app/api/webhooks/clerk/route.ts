import { clerkClient } from "@clerk/nextjs/server";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
export async function POST(req: Request) {
  const prisma = new PrismaClient();
  try {
    const evt = await verifyWebhook(req);
     console.log(evt)
    const { id } = evt.data;
    const eventType = evt.type;
    console.log(
      `Received webhook with ID ${id} and event type of ${eventType}`
    );
    console.log("Webhook payload:", evt.data);
    if (eventType === "user.created") {
      const {
        id,
        password_enabled,
        email_addresses,
        first_name,
        last_name,
        image_url,
      } = evt.data;
      const user = {
        firstName: first_name,
        lastName: last_name,
        email: email_addresses[0].email_address,
        password: password_enabled,
        image: image_url,
      };
    const isuserPresent=  await prisma.user.findUnique({
        where:{
            email:user.email
        }
      });
      if(isuserPresent){
        return
      }else{
       const User= await prisma.user.create({
            data: {
             firstName:user.firstName as string,
              lastName:user.lastName as string,
              email:user.email as string,
              password:user.password as boolean,
              image:user.image as string,
            }
        });
        if(User){
          const clerk = await clerkClient();

          await  clerk.users.updateUserMetadata(id, {
            publicMetadata: {
              userId: User.id,
            },
          });
        }
      }

    }

    return new NextResponse("Webhook received", { status: 200 });
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error verifying webhook", { status: 400 });
  }
}
