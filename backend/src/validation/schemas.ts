import { z } from 'zod';
import { JobParticipantRole } from '../entities/Job';

// User Schemas
export const userRegistrationSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  firstName: z.string().min(2).max(100),
  lastName: z.string().min(2).max(100),
  role: z.enum(['tradesperson', 'contractor', 'project_manager']),
  specialization: z.string().optional()
});

export const userLoginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

export const userUpdateSchema = z.object({
  firstName: z.string().min(2).max(100).optional(),
  lastName: z.string().min(2).max(100).optional(),
  specialization: z.string().optional(),
  password: z.string().min(8).max(100).optional()
});

// Job Schemas
export const jobCreationSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10),
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format"
  }),
  dueDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format"
  }),
  estimatedHours: z.number().positive().optional(),
  budget: z.number().positive().optional(),
  location: z.string().optional(),
  clientId: z.string().uuid()
}).refine(data => {
  const start = new Date(data.startDate);
  const due = new Date(data.dueDate);
  return start <= due;
}, {
  message: "Due date must be after start date",
  path: ["dueDate"]
});

export const jobUpdateSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().min(10).optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format"
  }).optional(),
  dueDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format"
  }).optional(),
  estimatedHours: z.number().positive().optional(),
  budget: z.number().positive().optional(),
  location: z.string().optional()
});

export const jobParticipantSchema = z.object({
  userId: z.string().uuid(),
  role: z.nativeEnum(JobParticipantRole)
});

// Task Schemas
export const taskCreationSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10),
  dueDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format"
  }),
  estimatedHours: z.number().positive().optional(),
  assignedToId: z.string().uuid().optional()
});

export const taskUpdateSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().min(10).optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
  dueDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format"
  }).optional(),
  estimatedHours: z.number().positive().optional(),
  assignedToId: z.string().uuid().optional()
}); 