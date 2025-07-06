'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function TodosPage() {
  const [todos, setTodos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getTodos() {
      // You may need to create a 'todos' table in your Supabase project.
      const { data, error } = await supabase.from('todos').select();

      if (error) {
        console.error('Error fetching todos:', error);
      } else if (data) {
        setTodos(data);
      }
      setLoading(false);
    }

    getTodos();
  }, []);

  return (
    <div className="container mx-auto p-8">
        <h1 className="text-2xl font-bold mb-4">My Todos</h1>
        {loading ? (
            <p className="text-muted-foreground">Loading...</p>
        ) : todos.length > 0 ? (
            <ul className="list-disc list-inside space-y-2">
                {todos.map((todo) => (
                    // Assumes your table has an 'id' and a text column.
                    // Replace 'task' with the actual column name from your 'todos' table.
                    <li key={todo.id}>{todo.task || JSON.stringify(todo)}</li>
                ))}
            </ul>
        ) : (
            <p className="text-muted-foreground">No todos found. Have you created a 'todos' table in Supabase yet?</p>
        )}
    </div>
  );
}
