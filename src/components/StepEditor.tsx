"use client";

import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import Image from "next/image";

export interface StepData {
  id: string;
  imageFile?: File;
  imagePreview?: string;
  imageUrl?: string;
  description: string;
}

interface StepEditorProps {
  steps: StepData[];
  setSteps: (steps: StepData[]) => void;
}

export function StepEditor({ steps, setSteps }: StepEditorProps) {
  const addStep = () => {
    setSteps([
      ...steps,
      { id: `step-${Date.now()}`, description: "" },
    ]);
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const updateStep = (index: number, updates: Partial<StepData>) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], ...updates };
    setSteps(newSteps);
  };

  const handleImageChange = (index: number, file: File) => {
    const preview = URL.createObjectURL(file);
    updateStep(index, { imageFile: file, imagePreview: preview });
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const newSteps = Array.from(steps);
    const [removed] = newSteps.splice(result.source.index, 1);
    newSteps.splice(result.destination.index, 0, removed);
    setSteps(newSteps);
  };

  return (
    <div>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="steps">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-3">
              {steps.map((step, index) => (
                <Draggable key={step.id} draggableId={step.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`flex gap-3 rounded-md border p-3 bg-white ${
                        snapshot.isDragging ? "border-gray-400 shadow-md" : "border-gray-200"
                      }`}
                    >
                      {/* Drag handle */}
                      <div
                        {...provided.dragHandleProps}
                        className="flex flex-col items-center justify-center gap-1 cursor-grab active:cursor-grabbing text-gray-400 px-1"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <circle cx="9" cy="6" r="1.5" />
                          <circle cx="15" cy="6" r="1.5" />
                          <circle cx="9" cy="12" r="1.5" />
                          <circle cx="15" cy="12" r="1.5" />
                          <circle cx="9" cy="18" r="1.5" />
                          <circle cx="15" cy="18" r="1.5" />
                        </svg>
                      </div>

                      {/* Step number */}
                      <div className="flex items-start pt-1">
                        <span className="flex h-6 w-6 items-center justify-center rounded bg-gray-900 text-xs font-medium text-white">
                          {index + 1}
                        </span>
                      </div>

                      {/* Image upload */}
                      <div className="flex-shrink-0">
                        <label className="block cursor-pointer">
                          <div className="relative w-24 h-24 rounded-md border border-gray-200 bg-gray-50 overflow-hidden">
                            {(step.imagePreview || step.imageUrl) ? (
                              <Image
                                src={step.imagePreview || step.imageUrl!}
                                alt={`Step ${index + 1}`}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                                </svg>
                                <span className="text-xs mt-1">Photo</span>
                              </div>
                            )}
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files?.[0]) handleImageChange(index, e.target.files[0]);
                            }}
                          />
                        </label>
                      </div>

                      {/* Description */}
                      <div className="flex-1 min-w-0">
                        <textarea
                          value={step.description}
                          onChange={(e) => updateStep(index, { description: e.target.value })}
                          placeholder="Describe this step (optional)..."
                          rows={3}
                          className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 resize-none"
                        />
                      </div>

                      {/* Remove button */}
                      <button
                        onClick={() => removeStep(index)}
                        className="flex-shrink-0 text-gray-400 hover:text-red-500 self-start pt-1"
                        type="button"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <button
        onClick={addStep}
        type="button"
        className="mt-3 flex items-center gap-2 rounded-md border border-dashed border-gray-300 px-4 py-2.5 text-sm text-gray-600 hover:border-gray-400 hover:text-gray-900 w-full justify-center"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Step
      </button>
    </div>
  );
}
