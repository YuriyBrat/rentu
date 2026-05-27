'use client';

import { useEffect, useMemo, useState } from 'react';
import {
   Alert,
   Box,
   Button,
   Checkbox,
   Dialog,
   DialogContent,
   FormControlLabel,
   Grid,
   IconButton,
   Stack,
   TextField,
   Typography,
} from '@mui/material';

import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';

function photoKey(photo, idx) {
   return photo?.publicId || photo?.url || `photo-${idx}`;
}

function normalizePhoto(photo) {
   return {
      url: photo?.url || '',
      publicId: photo?.publicId || photo?.public_id || '',
      kind: photo?.kind === 'live' ? 'live' : 'photo',
      caption: photo?.caption || '',
      showInPortfolio: photo?.showInPortfolio !== false,
      isPrimary: !!photo?.isPrimary,
      isHidden: !!photo?.isHidden,
      uploadedAt: photo?.uploadedAt || new Date().toISOString(),
   };
}

function normalizePhotoList(items) {
   const photos = (items || []).map(normalizePhoto).filter((photo) => photo.url);
   const requestedPrimaryIndex = photos.findIndex((photo) => photo.isPrimary && !photo.isHidden);
   const fallbackPrimaryIndex = photos.findIndex((photo) => !photo.isHidden);
   const primaryIndex = requestedPrimaryIndex >= 0 ? requestedPrimaryIndex : fallbackPrimaryIndex;

   return photos.map((photo, idx) => ({
      ...photo,
      isPrimary: idx === primaryIndex,
   }));
}

export default function EmployeePhotoGallery({ open, onClose, employee, canManage = false, onChanged }) {
   const [photos, setPhotos] = useState([]);
   const [livePhoto, setLivePhoto] = useState(null);
   const [deletePublicIds, setDeletePublicIds] = useState([]);
   const [files, setFiles] = useState([]);
   const [liveFiles, setLiveFiles] = useState([]);
   const [filePreviews, setFilePreviews] = useState([]);
   const [liveFilePreview, setLiveFilePreview] = useState(null);
   const [saving, setSaving] = useState(false);
   const [error, setError] = useState('');

   useEffect(() => {
      if (!open) return;
      setPhotos((employee?.photos || []).map(normalizePhoto));
      setLivePhoto(employee?.livePhoto?.url ? normalizePhoto(employee.livePhoto) : null);
      setDeletePublicIds([]);
      setFiles([]);
      setLiveFiles([]);
      setFilePreviews([]);
      setLiveFilePreview(null);
      setError('');
   }, [open, employee]);

   useEffect(() => {
      const previews = files.map((file) => ({
         name: file.name,
         url: URL.createObjectURL(file),
      }));
      setFilePreviews(previews);
      return () => previews.forEach((preview) => URL.revokeObjectURL(preview.url));
   }, [files]);

   useEffect(() => {
      if (!liveFiles[0]) {
         setLiveFilePreview(null);
         return undefined;
      }

      const preview = {
         name: liveFiles[0].name,
         url: URL.createObjectURL(liveFiles[0]),
      };
      setLiveFilePreview(preview);
      return () => URL.revokeObjectURL(preview.url);
   }, [liveFiles]);

   const visiblePhotos = useMemo(() => {
      const gallery = [
         ...(livePhoto?.url && !livePhoto.isHidden ? [livePhoto] : []),
         ...photos.filter((photo) => !photo.isHidden && photo.showInPortfolio),
      ];
      return gallery.slice(0, 6);
   }, [livePhoto, photos]);

   const setPhotoField = (idx, field, value) => {
      setPhotos((prev) => prev.map((photo, photoIdx) => {
         if (photoIdx !== idx) {
            return field === 'isPrimary' && value ? { ...photo, isPrimary: false } : photo;
         }
         return { ...photo, [field]: value };
      }));
   };

   const removePhoto = (idx) => {
      setPhotos((prev) => {
         const photo = prev[idx];
         if (photo?.publicId) {
            setDeletePublicIds((ids) => [...ids, photo.publicId]);
         }
         const next = prev.filter((_, photoIdx) => photoIdx !== idx);
         if (!next.some((item) => item.isPrimary) && next[0]) {
            next[0] = { ...next[0], isPrimary: true };
         }
         return next;
      });
   };

   const uploadFiles = async (kind, uploadFilesList) => {
      if (!uploadFilesList.length || !employee?._id) return;
      const fd = new FormData();
      fd.append('employeeId', employee._id);
      fd.append('kind', kind);
      uploadFilesList.forEach((file) => fd.append('files', file));

      const res = await fetch('/api/crm/employees/photos', {
         method: 'POST',
         body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Не вдалося завантажити фото');
      return Array.isArray(data?.photos) ? data.photos.map(normalizePhoto) : [];
   };

   const saveGallery = async () => {
      if (!employee?._id) return;
      setSaving(true);
      setError('');

      try {
         const uploadedPhotos = await uploadFiles('photo', files);
         const uploadedLivePhotos = await uploadFiles('live', liveFiles.slice(0, 1));
         const nextPhotos = normalizePhotoList([...photos, ...(uploadedPhotos || [])]);
         const nextLivePhoto = uploadedLivePhotos?.[0] || livePhoto;

         const res = await fetch('/api/crm/employees/photos', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               employeeId: employee._id,
               photos: nextPhotos,
               livePhoto: nextLivePhoto,
               deletePublicIds,
            }),
         });
         const data = await res.json();
         if (!res.ok) throw new Error(data?.error || 'Не вдалося зберегти галерею');

         onChanged?.(data.item);
         onClose?.();
      } catch (err) {
         setError(err?.message || 'Не вдалося зберегти галерею');
      } finally {
         setSaving(false);
      }
   };

   return (
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth PaperProps={{ sx: { bgcolor: '#0f0f17', color: '#fff', borderRadius: 3, border: '1px solid rgba(255,255,255,0.08)' } }}>
         <DialogContent>
            <Stack spacing={1.4}>
               <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                     <Typography sx={{ fontSize: 20, fontWeight: 950 }}>Галерея фото</Typography>
                     <Typography sx={{ color: 'rgba(255,255,255,0.58)', fontSize: 13 }}>
                        {employee?.name || ''}
                     </Typography>
                  </Box>
                  <IconButton onClick={onClose} sx={{ color: '#fff' }}>
                     <CloseRoundedIcon />
                  </IconButton>
               </Stack>

               {!!error && <Alert severity="error">{error}</Alert>}

               {!canManage && (
                  <Grid container spacing={1}>
                     {visiblePhotos.map((photo, idx) => (
                        <Grid item xs={6} md={4} key={photoKey(photo, idx)}>
                           <Box component="img" src={photo.url} alt={photo.caption || ''} sx={{ width: '100%', aspectRatio: '1 / 1', objectFit: 'cover', borderRadius: 2 }} />
                        </Grid>
                     ))}
                     {!visiblePhotos.length && (
                        <Grid item xs={12}>
                           <Typography sx={{ color: 'rgba(255,255,255,0.58)' }}>Фото поки немає.</Typography>
                        </Grid>
                     )}
                  </Grid>
               )}

               {canManage && (
                  <>
                     <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
                        <Button component="label" startIcon={<AddRoundedIcon />} sx={{ color: '#fff', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 2.5 }}>
                           Довантажити фото
                           <input hidden multiple accept="image/*" type="file" onChange={(e) => setFiles(Array.from(e.target.files || []))} />
                        </Button>
                        <Button component="label" startIcon={<AddRoundedIcon />} sx={{ color: '#fff', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 2.5 }}>
                           Оновити live фото / GIF
                           <input hidden accept="image/gif,image/*" type="file" onChange={(e) => setLiveFiles(Array.from(e.target.files || []).slice(0, 1))} />
                        </Button>
                        <Typography sx={{ color: 'rgba(255,255,255,0.62)', alignSelf: 'center', fontSize: 13 }}>
                           {files.length ? `Нових фото: ${files.length}` : ''}
                           {liveFiles.length ? ` Live: ${liveFiles[0].name}` : ''}
                        </Typography>
                     </Stack>

                     {(!!filePreviews.length || !!liveFilePreview) && (
                        <Box sx={{ p: 1, borderRadius: 2, border: '1px dashed rgba(255,255,255,0.18)' }}>
                           <Typography sx={{ fontWeight: 900, mb: 0.8 }}>Попередній перегляд нових фото</Typography>
                           <Grid container spacing={1}>
                              {liveFilePreview && (
                                 <Grid item xs={6} md={3}>
                                    <Box component="img" src={liveFilePreview.url} alt={liveFilePreview.name} sx={{ width: '100%', aspectRatio: '1 / 1', objectFit: 'cover', borderRadius: 2, border: '1px solid rgba(168,85,247,0.45)' }} />
                                    <Typography sx={{ color: 'rgba(255,255,255,0.62)', fontSize: 12, mt: 0.4 }} noWrap>
                                       Live: {liveFilePreview.name}
                                    </Typography>
                                 </Grid>
                              )}
                              {filePreviews.map((preview) => (
                                 <Grid item xs={6} md={3} key={preview.url}>
                                    <Box component="img" src={preview.url} alt={preview.name} sx={{ width: '100%', aspectRatio: '1 / 1', objectFit: 'cover', borderRadius: 2 }} />
                                    <Typography sx={{ color: 'rgba(255,255,255,0.62)', fontSize: 12, mt: 0.4 }} noWrap>
                                       {preview.name}
                                    </Typography>
                                 </Grid>
                              ))}
                           </Grid>
                        </Box>
                     )}

                     {!!livePhoto?.url && (
                        <Box sx={{ p: 1, borderRadius: 2, border: '1px solid rgba(168,85,247,0.35)' }}>
                           <Typography sx={{ fontWeight: 900, mb: 0.8 }}>Live фото / GIF</Typography>
                           <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
                              <Box component="img" src={livePhoto.url} alt="" sx={{ width: 130, height: 130, objectFit: 'cover', borderRadius: 2 }} />
                              <Stack spacing={1} sx={{ flex: 1 }}>
                                 <TextField label="Підпис" value={livePhoto.caption || ''} onChange={(e) => setLivePhoto((p) => ({ ...p, caption: e.target.value }))} />
                                 <FormControlLabel control={<Checkbox checked={!!livePhoto.showInPortfolio} onChange={(e) => setLivePhoto((p) => ({ ...p, showInPortfolio: e.target.checked }))} />} label="Показувати у візитівці" />
                                 <FormControlLabel control={<Checkbox checked={!!livePhoto.isHidden} onChange={(e) => setLivePhoto((p) => ({ ...p, isHidden: e.target.checked }))} />} label="Сховати" />
                              </Stack>
                           </Stack>
                        </Box>
                     )}

                     <Grid container spacing={1}>
                        {photos.map((photo, idx) => (
                           <Grid item xs={12} md={6} lg={4} key={photoKey(photo, idx)}>
                              <Box sx={{ p: 1, borderRadius: 2, border: '1px solid rgba(255,255,255,0.10)', bgcolor: 'rgba(255,255,255,0.025)' }}>
                                 <Box component="img" src={photo.url} alt={photo.caption || ''} sx={{ width: '100%', aspectRatio: '4 / 3', objectFit: 'cover', borderRadius: 1.5, opacity: photo.isHidden ? 0.45 : 1 }} />
                                 <Stack spacing={0.5} sx={{ mt: 1 }}>
                                    <TextField size="small" label="Підпис" value={photo.caption || ''} onChange={(e) => setPhotoField(idx, 'caption', e.target.value)} />
                                    <FormControlLabel control={<Checkbox checked={!!photo.isPrimary} onChange={(e) => setPhotoField(idx, 'isPrimary', e.target.checked)} />} label={<Stack direction="row" spacing={0.5} alignItems="center"><StarRoundedIcon fontSize="small" /> <span>Головне фото</span></Stack>} />
                                    <FormControlLabel control={<Checkbox checked={!!photo.showInPortfolio} onChange={(e) => setPhotoField(idx, 'showInPortfolio', e.target.checked)} />} label="Показувати у візитівці" />
                                    <FormControlLabel control={<Checkbox checked={!!photo.isHidden} onChange={(e) => setPhotoField(idx, 'isHidden', e.target.checked)} />} label="Сховати" />
                                    <Button onClick={() => removePhoto(idx)} startIcon={<DeleteOutlineRoundedIcon />} sx={{ color: '#fca5a5', alignSelf: 'flex-start' }}>
                                       Видалити
                                    </Button>
                                 </Stack>
                              </Box>
                           </Grid>
                        ))}
                     </Grid>

                     <Stack direction="row" justifyContent="flex-end" spacing={1}>
                        <Button onClick={onClose} sx={{ color: 'rgba(255,255,255,0.75)' }}>Скасувати</Button>
                        <Button onClick={saveGallery} disabled={saving} sx={{ color: '#111', fontWeight: 900, borderRadius: 2.5, background: 'linear-gradient(90deg, rgba(139,92,246,1), rgba(168,85,247,1))' }}>
                           {saving ? 'Збереження...' : 'Зберегти галерею'}
                        </Button>
                     </Stack>
                  </>
               )}
            </Stack>
         </DialogContent>
      </Dialog>
   );
}
