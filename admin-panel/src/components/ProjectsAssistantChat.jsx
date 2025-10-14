import React from 'react';
import { MessageCircle } from 'lucide-react';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';

const ProjectsAssistantChat = () => {
  return (
    <section className="bg-elev1 border border-line-soft rounded-16 shadow-elev1 p-6">
      <header className="flex items-center gap-3 mb-4">
        <MessageCircle className="text-brand" size={22} />
        <div>
          <h2 className="text-[18px] font-semibold leading-6 text-text-primary">Projects Assistant</h2>
          <p className="text-[13px] text-text-secondary">
            Ask questions about your projects and capture quick planning notes.
          </p>
        </div>
      </header>
      <div className="space-y-3">
        <Textarea rows={4} placeholder="Ask the assistant about timelines, blockers, or next steps..." />
        <div className="flex items-center justify-end">
          <Button type="button" disabled>
            Send (coming soon)
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ProjectsAssistantChat;
