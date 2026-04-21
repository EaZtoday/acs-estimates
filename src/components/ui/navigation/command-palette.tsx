"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/navigation/command";
import { getDashboardNavigation } from "@/lib/navigation-config";
import { ProfileImage } from "@/components/ui/data-display/profile-image";
import { SETTINGS_GROUPS } from "@/components/features/settings/settings.config";
import { Settings } from "lucide-react";

interface CommandPaletteProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialData?: {
    organizations: ContentItem[];
    customers: ContentItem[];
    jobs: ContentItem[];
    offers: ContentItem[];
    services: ContentItem[];
  };
}

interface ContentItem {
  id: string;
  name: string;
  href: string;
  description?: string;
  status?: string;
  imageUrl?: string;
  fallback?: string;
}

export function CommandPalette({
  open,
  onOpenChange,
  initialData,
}: CommandPaletteProps) {
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const [isSearching, setIsSearching] = React.useState(false);

  const navigationItems = React.useMemo(() => {
    return getDashboardNavigation();
  }, []);

  const [contentData, setContentData] = React.useState<{
    organizations: ContentItem[];
    customers: ContentItem[];
    jobs: ContentItem[];
    offers: ContentItem[];
    services: ContentItem[];
  }>({
    organizations: initialData?.organizations ?? [],
    customers: initialData?.customers ?? [],
    jobs: initialData?.jobs ?? [],
    offers: initialData?.offers ?? [],
    services: initialData?.services ?? [],
  });

  React.useEffect(() => {
    if (!open) return;
    const query = search.trim();

    if (initialData) {
      setContentData(initialData);
      return;
    }

    if (query.length < 2) {
      setContentData({
        organizations: [],
        customers: [],
        jobs: [],
        offers: [],
        services: [],
      });
      return;
    }

    const abortController = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      try {
        setIsSearching(true);
        const response = await fetch(
          `/api/search/command-palette?q=${encodeURIComponent(query)}&limit=8`,
          { signal: abortController.signal },
        );
        if (!response.ok) {
          throw new Error(`Failed to search command palette: ${response.status}`);
        }
        const payload = (await response.json()) as typeof contentData;
        setContentData(payload);
      } catch (err) {
        if (
          err instanceof Error &&
          (err.name === "AbortError" || err.message.includes("aborted"))
        ) {
          return;
        }
        console.error("Error searching command palette:", err);
      } finally {
        setIsSearching(false);
      }
    }, 150);

    return () => {
      window.clearTimeout(timeoutId);
      abortController.abort();
    };
  }, [open, search, initialData]);

  const handleSelect = (value: string) => {
    router.push(value);
    onOpenChange?.(false);
    setSearch("");
  };

  const filteredNavigation = React.useMemo(
    () =>
      navigationItems.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [search, navigationItems],
  );

  const filteredContent = React.useMemo(
    () =>
      Object.entries(contentData).reduce(
        (acc, [key, items]) => {
          const filtered = items.filter(
            (item) =>
              item.name.toLowerCase().includes(search.toLowerCase()) ||
              item.description?.toLowerCase().includes(search.toLowerCase()) ||
              item.status?.toLowerCase().includes(search.toLowerCase()),
          );
          if (filtered.length > 0) {
            (acc as Record<string, ContentItem[]>)[key] = filtered;
          }
          return acc;
        },
        {} as Record<string, ContentItem[]>,
      ),
    [search, contentData],
  );

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <div className="relative flex items-center w-full">
        <CommandInput
          placeholder="Search (type at least 2 characters)"
          value={search}
          onValueChange={setSearch}
        />
        <button
          onClick={() => onOpenChange?.(false)}
          className="absolute right-3 px-2 py-1 text-xs text-muted-foreground border border-border rounded hover:bg-accent transition-colors"
        >
          Esc
        </button>
      </div>
      <CommandList className="max-h-[400px]">
        <CommandEmpty>
          <div className="px-3 py-4 text-center text-sm text-muted-foreground">
            {isSearching ? "Searching..." : "No results found."}
          </div>
        </CommandEmpty>

        {filteredNavigation.length > 0 && (
          <CommandGroup heading="Navigation">
            {filteredNavigation
              .filter((item) => item.name !== "Settings")
              .map((item) => {
                const Icon = item.icon;
                return (
                  <CommandItem
                    key={item.href}
                    value={item.href}
                    onSelect={handleSelect}
                  >
                    <Icon className="mr-2 h-3 w-3 text-muted-foreground/70" />
                    <span>{item.name}</span>
                  </CommandItem>
                );
              })}
            {filteredNavigation.some((item) => item.name === "Settings") && (
              <>
                <CommandSeparator />
                {(() => {
                  const settingsItem = filteredNavigation.find(
                    (item) => item.name === "Settings",
                  );
                  if (!settingsItem) return null;
                  const SettingsIcon = settingsItem.icon;
                  return (
                    <CommandItem
                      value={settingsItem.href}
                      onSelect={handleSelect}
                    >
                      <SettingsIcon className="mr-2 h-3 w-3 text-muted-foreground/70" />
                      <span>{settingsItem.name}</span>
                    </CommandItem>
                  );
                })()}
              </>
            )}
          </CommandGroup>
        )}

        {(() => {
          const allSettingsItems = SETTINGS_GROUPS.flatMap((group) =>
            group.items.map((item) => ({
              ...item,
              href: `/dashboard/settings`,
            })),
          );

          const filteredSettingsItems = allSettingsItems.filter((item) =>
            item.label.toLowerCase().includes(search.toLowerCase()),
          );

          if (filteredSettingsItems.length === 0) return null;

          return (
            <>
              <CommandSeparator />
              <CommandGroup heading="Settings">
                {filteredSettingsItems.map((item) => (
                  <CommandItem
                    key={item.slug}
                    value={item.href}
                    onSelect={handleSelect}
                  >
                    <Settings className="mr-2 h-3 w-3 text-muted-foreground/70" />
                    <span>{item.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          );
        })()}

        {search.trim() !== "" && Object.keys(filteredContent).length > 0 && (
          <>
            {filteredNavigation.length > 0 && <CommandSeparator />}
            {Object.entries(filteredContent).map(([section, items]) => {
              const sectionConfig = navigationItems.find((item) =>
                item.href.includes(`/${section}`),
              );
              if (!sectionConfig || items.length === 0) {
                return null;
              }

              const Icon = sectionConfig.icon;
              return (
                <React.Fragment key={section}>
                  <CommandSeparator />
                  <CommandGroup heading={sectionConfig.name}>
                    {items.map((item) => (
                      <CommandItem
                        key={item.id}
                        value={item.href}
                        onSelect={handleSelect}
                      >
                        {section === "customers" ||
                        section === "organizations" ? (
                          <ProfileImage
                            src={item.imageUrl}
                            alt={item.name}
                            size="xs"
                            fallback={item.fallback || item.name}
                            className="mr-2"
                          />
                        ) : (
                          <Icon className="mr-2 h-3 w-3 text-muted-foreground/70" />
                        )}
                        <span>{item.name}</span>
                        {item.status && (
                          <span className="ml-auto text-xs text-muted-foreground">
                            {item.status}
                          </span>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </React.Fragment>
              );
            })}
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
