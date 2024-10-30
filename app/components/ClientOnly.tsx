import { useEffect, useState } from 'react';

export default function ClientOnly({ 
  children 
}: { 
  children: () => React.ReactNode 
}) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="animate-pulse bg-gray-200 rounded h-full w-full" />
      </div>
    );
  }

  return <>{children()}</>;
} 