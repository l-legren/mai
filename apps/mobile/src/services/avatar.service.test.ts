import { AVATAR_MAX_BYTES, AvatarUploadError, uploadAvatar } from './avatar.service';

jest.mock('@mai/api', () => ({
  ...jest.requireActual('@mai/api'),
  uploadAvatarFile: jest.fn().mockResolvedValue('user-1/avatar'),
}));

function fakeBytes(byteLength: number): ArrayBuffer {
  return new ArrayBuffer(byteLength);
}

describe('uploadAvatar', () => {
  it('uploads a valid PNG within the size limit', async () => {
    await expect(uploadAvatar(fakeBytes(1024), 'image/png')).resolves.toBe('user-1/avatar');
  });

  it('rejects a file larger than the 5MB bucket limit', async () => {
    const oversized = fakeBytes(AVATAR_MAX_BYTES + 1);
    await expect(uploadAvatar(oversized, 'image/png')).rejects.toMatchObject(
      new AvatarUploadError('tooLarge')
    );
  });

  it('rejects an unsupported content type', async () => {
    await expect(uploadAvatar(fakeBytes(1024), 'text/plain')).rejects.toMatchObject(
      new AvatarUploadError('unsupportedType')
    );
  });
});
