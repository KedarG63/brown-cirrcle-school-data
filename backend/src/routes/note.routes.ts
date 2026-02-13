import { Router } from 'express';
import { noteController } from '../controllers/noteController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { z } from 'zod';

const router = Router();

router.use(authenticate);

const createNoteSchema = z.object({
  title: z.string().max(200).optional(),
  content: z.string().max(10000).optional(),
  noteType: z.enum(['TEXT', 'CHECKLIST']).optional(),
  color: z.enum(['DEFAULT', 'RED', 'ORANGE', 'YELLOW', 'GREEN', 'TEAL', 'BLUE', 'PURPLE', 'GRAY']).optional(),
  schoolId: z.string().uuid().optional(),
  visitId: z.string().uuid().optional(),
  checklistItems: z
    .array(
      z.object({
        text: z.string().min(1),
        isCompleted: z.boolean().optional(),
        position: z.number().optional(),
      })
    )
    .optional(),
});

const updateNoteSchema = z.object({
  title: z.string().max(200).optional().nullable(),
  content: z.string().max(10000).optional().nullable(),
  noteType: z.enum(['TEXT', 'CHECKLIST']).optional(),
  color: z.enum(['DEFAULT', 'RED', 'ORANGE', 'YELLOW', 'GREEN', 'TEAL', 'BLUE', 'PURPLE', 'GRAY']).optional(),
  schoolId: z.string().uuid().optional().nullable(),
  visitId: z.string().uuid().optional().nullable(),
});

const colorSchema = z.object({
  color: z.enum(['DEFAULT', 'RED', 'ORANGE', 'YELLOW', 'GREEN', 'TEAL', 'BLUE', 'PURPLE', 'GRAY']),
});

const checklistItemSchema = z.object({
  text: z.string().min(1).max(500),
  position: z.number().optional(),
});

const updateChecklistItemSchema = z.object({
  text: z.string().min(1).max(500).optional(),
  isCompleted: z.boolean().optional(),
  position: z.number().optional(),
});

const labelSchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().max(20).optional(),
});

// Notes CRUD
router.get('/', noteController.getAll);
router.post('/', validate(createNoteSchema), noteController.create);
router.get('/labels', noteController.getAllLabels);
router.post('/labels', validate(labelSchema), noteController.createLabel);
router.put('/labels/:id', validate(labelSchema.partial()), noteController.updateLabel);
router.delete('/labels/:id', noteController.deleteLabel);
router.get('/:id', noteController.getById);
router.put('/:id', validate(updateNoteSchema), noteController.update);
router.delete('/:id', noteController.permanentDelete);

// Note actions
router.put('/:id/pin', noteController.togglePin);
router.put('/:id/archive', noteController.toggleArchive);
router.put('/:id/trash', noteController.moveToTrash);
router.put('/:id/restore', noteController.restoreFromTrash);
router.put('/:id/color', validate(colorSchema), noteController.updateColor);

// Checklist items
router.post('/:id/checklist-items', validate(checklistItemSchema), noteController.addChecklistItem);
router.put('/:id/checklist-items/:itemId', validate(updateChecklistItemSchema), noteController.updateChecklistItem);
router.delete('/:id/checklist-items/:itemId', noteController.deleteChecklistItem);

// Note-label associations
router.post('/:noteId/labels/:labelId', noteController.addLabelToNote);
router.delete('/:noteId/labels/:labelId', noteController.removeLabelFromNote);

export default router;
