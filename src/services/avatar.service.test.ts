import { AVATAR_MAX_BYTES, AvatarUploadError, uploadAvatar } from './avatar.service';

jest.mock('@/data/avatar.data', () => ({
  uploadAvatarFile: jest.fn().mockResolvedValue('user-1/avatar'),
}));

function fakeBlob(size: number, type: string): Blob {
  return { size, type } as Blob;
}

describe('uploadAvatar', () => {
  it('uploads a valid PNG within the size limit', async () => {
    await expect(uploadAvatar(fakeBlob(1024, 'image/png'), 'image/png')).resolves.toBe(
      'user-1/avatar'
    );
  });

  it('rejects a file larger than the 5MB bucket limit', async () => {
    const oversized = fakeBlob(AVATAR_MAX_BYTES + 1, 'image/png');
    await expect(uploadAvatar(oversized, 'image/png')).rejects.toMatchObject(
      new AvatarUploadError('tooLarge')
    );
  });

  it('rejects an unsupported content type', async () => {
    await expect(uploadAvatar(fakeBlob(1024, 'text/plain'), 'text/plain')).rejects.toMatchObject(
      new AvatarUploadError('unsupportedType')
    );
  });
});
