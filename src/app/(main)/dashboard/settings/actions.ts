'use server';

import prisma from '@/lib/prisma';
import { getSession } from '@/utils/sessions';
import { accountSettingsSchema, AccountSettingsValues } from '@/validations/user/accountSettingsSchema';
import { del } from '@vercel/blob';
import bcrypt from 'bcryptjs';

export async function updateAccountSettings(values: AccountSettingsValues) {
  try {
    const validatedValues = accountSettingsSchema.parse(values);
    const { firstName, lastName, nickname, image, previousImage, newPassword } = validatedValues;

    const session = await getSession();
    const userId = session?.user?.id;
    if (!userId) throw new Error('Not authenticated');

    // Delete old image if replaced
    if (
      previousImage &&
      previousImage.includes('vercel-storage') &&
      previousImage !== image
    ) {
      await del(previousImage);
    }

    const updateData: any = {
      firstName,
      lastName,
      nickname,
      image,
    };

    if (newPassword) {
      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return { success: 'Account settings updated successfully.' };
  } catch (error) {
    console.error('Error updating account settings:', error);
    return { error: 'Something went wrong. Please try again.' };
  }
}
