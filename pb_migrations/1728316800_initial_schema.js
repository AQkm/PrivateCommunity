migrate((app) => {
  const events = new Collection({
    type: 'base',
    name: 'Events',
    listRule: '',
    viewRule: '',
    createRule: '',
    updateRule: '',
    deleteRule: '',
    fields: [
      { type: 'text', name: 'title', required: true, min: 1, max: 120 },
      { type: 'date', name: 'date', required: true },
      { type: 'text', name: 'description', max: 1000 },
      { type: 'autodate', name: 'created', onCreate: true, onUpdate: false },
      { type: 'autodate', name: 'updated', onCreate: true, onUpdate: true },
    ],
    indexes: ['CREATE INDEX idx_events_date ON events (date)'],
  });
  app.save(events);

  const photos = new Collection({
    type: 'base',
    name: 'Photos',
    listRule: '',
    viewRule: '',
    createRule: '',
    deleteRule: '',
    fields: [
      {
        type: 'file',
        name: 'photo',
        required: true,
        maxSelect: 1,
        maxSize: 20 * 1024 * 1024,
        mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        thumbs: ['300x300'],
      },
      { type: 'autodate', name: 'created', onCreate: true, onUpdate: false },
      { type: 'autodate', name: 'updated', onCreate: true, onUpdate: true },
    ],
    indexes: ['CREATE INDEX idx_photos_created ON photos (created)'],
  });
  photos.fields.add(new RelationField({
    name: 'event',
    collectionId: events.id,
    cascadeDelete: false,
    maxSelect: 1,
  }));
  app.save(photos);
}, (app) => {
  app.delete(app.findCollectionByNameOrId('Photos'));
  app.delete(app.findCollectionByNameOrId('Events'));
});
