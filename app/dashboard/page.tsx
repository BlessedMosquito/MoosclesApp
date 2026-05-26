'use client';

import Button from '@/components/ui/Button';
import Tile from '@/components/ui/Tile';    
import { supabase } from '@/lib/supabase';

export default function DashboardPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#0B0B0F',

        padding: 24,

        display: 'flex',
        flexDirection: 'column',
        gap: 20,
      }}
    >
      <h1
        style={{
          color: 'white',
          fontSize: 34,
          fontWeight: 700,
        }}
      >
        Dashboard
      </h1>

      <Tile
        title="Start Workout"
        subtitle="Track your training session"
      >
        <Button
          title="Begin"
          onClick={() => supabase.auth.signOut()}
        />
      </Tile>

      <Tile
        title="Weekly Progress"
        subtitle="4 workouts completed"
      />

      <Tile
        title="Current Streak"
        subtitle="12 days"
      />
    </main>
  );
}