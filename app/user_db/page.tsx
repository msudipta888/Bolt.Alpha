import { auth, clerkClient } from "@clerk/nextjs/server"
import { notFound, redirect } from "next/navigation";
import { prismaClient } from "../api/prismaClient/Prisma";

const SyncUser = async () => {

    const { userId } = await auth();
    if (!userId) {
        throw new Error("User not found");
    }
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    if (!user.emailAddresses[0].emailAddress) {
        return notFound();
    }
    await prismaClient.user.upsert({
        where: {
            email: user.emailAddresses[0]?.emailAddress
        },
        update: {
            firstName: user.firstName ?? "",
            lastName: user.lastName ?? "",
            image: user.imageUrl,
        },
        create: {
            id: userId,
            email: user.emailAddresses[0].emailAddress,
            firstName: user.firstName ?? "",
            lastName: user.lastName ?? "",
            image: user.imageUrl,
        }
    })
    redirect('/')

}
const UserDBPage = async () => {
    await SyncUser();

    return (
        <div>
            <h1>Syncing User...</h1>
        </div>
    );
};

export default UserDBPage;