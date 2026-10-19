import { useCallback, useEffect, useState } from 'react';
import { pb, type EventRecord, type PhotoRecord } from './lib/pocketbase';

const pageSize = 24;
const maxPhotoSize = 20 * 1024 * 1024;

function App() {
  const [photos, setPhotos] = useState<PhotoRecord[]>([]);
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [eventFormOpen, setEventFormOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [savingEvent, setSavingEvent] = useState(false);
  const [editingEventId, setEditingEventId] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingEventId, setDeletingEventId] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(0);
  const [galleryOpen, setGalleryOpen] = useState(false);

  const loadPhotos = useCallback(async (nextPage = 1) => {
    setLoading(true);
    try {
      const result = await pb.collection('Photos').getList<PhotoRecord>(nextPage, pageSize, {
        sort: '-created',
        filter: selectedEventId ? `event = "${selectedEventId}"` : '',
      });
      setPhotos((current) => nextPage === 1 ? result.items : [...current, ...result.items]);
      setPage(result.page);
      setTotalPages(result.totalPages);
      setError('');
    } catch {
      setError('Could not load photos. Check that PocketBase is running.');
    } finally {
      setLoading(false);
    }
  }, [selectedEventId]);

  useEffect(() => { if (galleryOpen) void loadPhotos(); }, [galleryOpen, loadPhotos]);
  useEffect(() => {
    void pb.collection('Events').getFullList<EventRecord>({ sort: '-date' })
      .then(setEvents)
      .catch((error: unknown) => console.error('Could not load the timeline from PocketBase.', error));
  }, []);

  async function createEvent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!eventTitle.trim() || !eventDate) return;
    setSavingEvent(true);
    try {
      const created = await pb.collection('Events').create<EventRecord>({
        title: eventTitle.trim(), date: new Date(`${eventDate}T12:00:00`).toISOString(), description: eventDescription.trim(),
      });
      setEvents((current) => [...current, created].sort((a, b) => b.date.localeCompare(a.date)));
      setEventTitle(''); setEventDate(''); setEventDescription(''); setEventFormOpen(false); setError('');
    } catch {
      setError('Could not add this timeline moment. Please try again.');
    } finally {
      setSavingEvent(false);
    }
  }

  function beginEditEvent(item: EventRecord) {
    setEditingEventId(item.id);
    setEditTitle(item.title);
    setEditDate(item.date.slice(0, 10));
    setEditDescription(item.description ?? '');
    setError('');
  }

  async function saveEventEdit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingEventId || !editTitle.trim() || !editDate) return;
    setSavingEdit(true);
    try {
      const updated = await pb.collection('Events').update<EventRecord>(editingEventId, {
        title: editTitle.trim(),
        date: new Date(`${editDate}T12:00:00`).toISOString(),
        description: editDescription.trim(),
      });
      setEvents((current) => current.map((item) => item.id === updated.id ? updated : item).sort((a, b) => b.date.localeCompare(a.date)));
      setEditingEventId('');
      setError('');
    } catch {
      setError('Could not save gallery changes. Please try again.');
    } finally {
      setSavingEdit(false);
    }
  }

  async function removeEvent(item: EventRecord) {
    const confirmed = window.confirm(`Delete “${item.title}” from the timeline? Its photos will remain in the family gallery.`);
    if (!confirmed) return;

    setDeletingEventId(item.id);
    setError('');
    try {
      const linkedPhotos = await pb.collection('Photos').getFullList<PhotoRecord>({
        filter: `event = "${item.id}"`,
      });
      await Promise.all(linkedPhotos.map((photo) =>
        pb.collection('Photos').update(photo.id, { event: '' }),
      ));
      await pb.collection('Events').delete(item.id);
      setEvents((current) => current.filter((event) => event.id !== item.id));
      if (selectedEventId === item.id) {
        setSelectedEventId('');
        setPhotos([]);
        setPage(1);
      }
      if (editingEventId === item.id) setEditingEventId('');
    } catch {
      setError('Could not delete this timeline gallery. Please try again.');
    } finally {
      setDeletingEventId('');
    }
  }

  function openEventGallery(eventId: string) {
    setSelectedEventId(eventId);
    setPhotos([]); setPage(1); setGalleryOpen(true);
    window.setTimeout(() => document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' }), 0);
  }

  async function handleFiles(files: FileList | null) {
    if (!files) return;
    const selected = Array.from(files);
    const supportedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const images = selected.filter((file) => supportedTypes.includes(file.type));
    if (selected.some((file) => file.type.startsWith('image/') && !supportedTypes.includes(file.type))) {
      setError('Only JPEG, PNG, WebP, and GIF images are supported.');
      return;
    }
    const oversized = images.find((file) => file.size > maxPhotoSize);
    if (oversized) {
      setError(`${oversized.name} exceeds the 20 MB per-photo limit.`);
      return;
    }
    if (images.length === 0) {
      setError('Choose one or more supported image files.');
      return;
    }
    setError('');
    setUploading(1);
    let uploaded = 0;
    try {
      for (const file of images) {
        await pb.collection('Photos').create({ photo: file, ...(selectedEventId ? { event: selectedEventId } : {}) });
        uploaded += 1;
        setUploading(uploaded + 1);
      }
    } catch {
      setError(`Could not upload all photos (${uploaded} of ${images.length} uploaded).`);
    } finally {
      setUploading(0);
      await loadPhotos();
    }
  }

  async function removePhoto(id: string) {
    try {
      await pb.collection('Photos').delete(id);
      setPhotos((current) => current.filter((photo) => photo.id !== id));
    } catch {
      setError('Could not remove this photo. Please try again.');
    }
  }

  return (
    <main className="min-h-screen px-5 py-6 sm:px-10 sm:py-10">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl flex-col sm:min-h-[calc(100vh-5rem)]">
        <header className="flex items-center justify-between">
          <a className="flex min-h-11 items-center gap-3" href="#home" aria-label="Family Portal home">
            <span className="brand-mark" aria-hidden="true">f</span>
            <span className="text-sm font-semibold tracking-tight text-stone-800">our little corner</span>
          </a>
        </header>

        <section className="grid flex-1 items-start gap-10 py-10 sm:py-16 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16" id="home">
          <div className="relative z-10 mx-auto max-w-xl md:mx-0">
            <h1 className="mt-6 text-[clamp(3.25rem,10vw,6.5rem)] font-semibold leading-[0.94] tracking-[-0.075em] text-stone-900">
              Family<br /><span className="font-serif font-normal italic text-terracotta">Memories</span>
            </h1>
          </div>
          <section id="timeline" aria-labelledby="timeline-title" className="min-w-0" data-testid="timeline">
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div><h2 id="timeline-title" className="font-serif text-3xl font-normal text-stone-900 sm:text-4xl">Timeline</h2></div>
              <button type="button" className="explore-button min-h-11 rounded-full px-5 text-sm font-semibold" onClick={() => setEventFormOpen((open) => !open)} aria-expanded={eventFormOpen} aria-controls="new-gallery" data-testid="toggle-add-gallery">{eventFormOpen ? 'Cancel' : 'Add gallery'}</button>
            </div>
            {eventFormOpen && <form id="new-gallery" onSubmit={(event) => void createEvent(event)} className="grid max-w-xl gap-3 rounded-3xl border border-stone-200/80 bg-white/70 p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
              <label className="grid gap-1.5 text-sm font-semibold text-stone-700">Title<input required maxLength={120} value={eventTitle} onChange={(event) => setEventTitle(event.target.value)} placeholder="Summer by the sea" className="min-h-11 rounded-xl border border-stone-300 bg-white px-3 font-normal" data-testid="timeline-title-input" /></label>
              <label className="grid gap-1.5 text-sm font-semibold text-stone-700">Date<input required type="date" value={eventDate} onChange={(event) => setEventDate(event.target.value)} className="min-h-11 rounded-xl border border-stone-300 bg-white px-3 font-normal" data-testid="timeline-date-input" /></label>
              <label className="grid gap-1.5 text-sm font-semibold text-stone-700 sm:col-span-2">Description<textarea maxLength={1000} value={eventDescription} onChange={(event) => setEventDescription(event.target.value)} rows={2} className="rounded-xl border border-stone-300 bg-white px-3 py-2 font-normal" /></label>
              <button disabled={savingEvent} className="explore-button min-h-11 rounded-full px-5 text-sm font-semibold disabled:opacity-60" type="submit" data-testid="add-timeline-event">{savingEvent ? 'Adding…' : 'Create'}</button>
            </form>}
            {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
            <div className="relative">
              <div className="absolute bottom-4 left-3 top-4 w-px bg-teal-200" aria-hidden="true" />
              {events.length === 0 ? <p className="rounded-3xl border border-dashed border-stone-300 bg-white/60 px-6 py-10 text-center text-sm text-stone-500">No galleries yet.</p> :
                <ol className="grid gap-4" data-testid="timeline-events">
                  {events.map((item) => <li key={item.id} className="relative pl-10">
                    <span className="absolute left-0 top-5 grid h-7 w-7 place-items-center rounded-full border-4 border-sky-100 bg-teal-500" aria-hidden="true" />
                    <article className="rounded-3xl border border-stone-200/80 bg-white p-5 shadow-sm">
                      <p className="text-xs font-bold uppercase tracking-wider text-sky-700">{new Date(item.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      <h3 className="mt-2 font-serif text-xl text-stone-900">{item.title}</h3>
                      {item.description && <p className="mt-2 text-sm leading-6 text-stone-600">{item.description}</p>}
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button type="button" onClick={() => openEventGallery(item.id)} className="min-h-11 rounded-full border border-sky-200 bg-sky-50 px-4 text-sm font-semibold text-sky-800 hover:bg-sky-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2" data-testid={`open-event-gallery-${item.id}`}>Open gallery</button>
                        <button type="button" onClick={() => editingEventId === item.id ? setEditingEventId('') : beginEditEvent(item)} className="min-h-11 rounded-full border border-stone-300 bg-white px-4 text-sm font-semibold text-stone-700 hover:bg-stone-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2" aria-expanded={editingEventId === item.id} aria-controls={`edit-gallery-${item.id}`} data-testid={`edit-event-${item.id}`}>Edit</button>
                        <button type="button" onClick={() => void removeEvent(item)} disabled={deletingEventId === item.id} className="min-h-11 rounded-full border border-red-200 bg-white px-4 text-sm font-semibold text-red-700 hover:bg-red-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60" data-testid={`delete-event-${item.id}`}>{deletingEventId === item.id ? 'Deleting…' : 'Delete'}</button>
                      </div>
                      {editingEventId === item.id && <form id={`edit-gallery-${item.id}`} onSubmit={(event) => void saveEventEdit(event)} className="mt-4 grid gap-3 border-t border-stone-200 pt-4">
                        <label className="grid gap-1.5 text-sm font-semibold text-stone-700">Title<input required maxLength={120} value={editTitle} onChange={(event) => setEditTitle(event.target.value)} className="min-h-11 rounded-xl border border-stone-300 bg-white px-3 font-normal" /></label>
                        <label className="grid gap-1.5 text-sm font-semibold text-stone-700">Date<input required type="date" value={editDate} onChange={(event) => setEditDate(event.target.value)} className="min-h-11 rounded-xl border border-stone-300 bg-white px-3 font-normal" /></label>
                        <label className="grid gap-1.5 text-sm font-semibold text-stone-700">Description<textarea maxLength={1000} value={editDescription} onChange={(event) => setEditDescription(event.target.value)} rows={3} className="rounded-xl border border-stone-300 bg-white px-3 py-2 font-normal" /></label>
                        <div className="flex gap-2"><button type="submit" disabled={savingEdit} className="explore-button min-h-11 rounded-full px-4 text-sm font-semibold disabled:opacity-60">{savingEdit ? 'Saving…' : 'Save changes'}</button><button type="button" onClick={() => setEditingEventId('')} className="min-h-11 rounded-full border border-stone-300 px-4 text-sm font-semibold text-stone-700">Cancel</button></div>
                      </form>}
                    </article>
                  </li>)}
                </ol>}
            </div>
          </div>
          </section>
        </section>

        {galleryOpen && <section id="gallery" aria-labelledby="gallery-title" className="scroll-mt-8 border-t border-stone-200/80 py-12 sm:py-16">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">Shared memories</p>
              <h2 id="gallery-title" data-testid="gallery-title" className="mt-3 font-serif text-3xl font-normal text-stone-900 sm:text-4xl">{selectedEventId ? events.find((item) => item.id === selectedEventId)?.title ?? 'Timeline gallery' : 'The family gallery'}</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <label className="explore-button inline-flex min-h-12 cursor-pointer items-center justify-center rounded-full px-5 text-sm font-semibold focus-within:outline focus-within:outline-3 focus-within:outline-offset-4">
                {uploading ? `Uploading ${Math.min(uploading, 99)}…` : 'Add photos'}
                <input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple data-testid="photo-file-input" onChange={(event) => { void handleFiles(event.target.files); event.target.value = ''; }} disabled={uploading > 0} />
              </label>
            </div>
          </div>
          {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
          {!loading && photos.length === 0 ? (
            <div className="mt-7 rounded-3xl border border-dashed border-stone-300 bg-white/60 px-6 py-12 text-center sm:px-10">
              <p className="font-serif text-xl italic text-stone-700">No photos yet.</p>
            </div>
          ) : (
            <ul className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4" data-testid="photo-gallery">
              {photos.map((photo) => (
                <li key={photo.id} className="group relative overflow-hidden rounded-2xl bg-white shadow-sm">
                  <img src={pb.files.getUrl(photo, photo.photo, { thumb: '300x300' })} alt="Family memory" loading="lazy" className="aspect-square w-full object-cover" />
                  <button type="button" onClick={() => void removePhoto(photo.id)} aria-label="Remove photo" className="absolute right-2 top-2 grid min-h-11 min-w-11 place-items-center rounded-full bg-white/95 text-lg text-stone-800 shadow hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2" data-testid="remove-photo">×</button>
                </li>
              ))}
            </ul>
          )}
          {loading && <p role="status" className="mt-7 text-sm text-stone-500">Loading photos…</p>}
          {!loading && page < totalPages && <button type="button" onClick={() => void loadPhotos(page + 1)} className="mt-6 min-h-11 rounded-full border border-stone-300 bg-white px-5 text-sm font-semibold text-stone-700 hover:bg-stone-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">Load more photos</button>}
        </section>}

      </div>
    </main>
  );
}

export default App;
