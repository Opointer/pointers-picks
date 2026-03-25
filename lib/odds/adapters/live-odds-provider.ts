import { getDataProvider } from "@/lib/data/provider-factory";
import {
  createOddsFetchMeta,
  getLiveOddsConfig,
  withPlayerPropOddsMeta,
} from "@/lib/odds/health";
import { normalizeFeaturedGameOdds } from "@/lib/odds/normalize";
import { type OddsProvider } from "@/lib/odds/provider";
import { normalizePlayerPropOffers } from "@/lib/props/normalize/offers";
import { toLegacyPlayerPropOdds } from "@/lib/props/normalize/legacy";
import {
  type GameOdds,
  type PlayerPropFeed,
  type PlayerPropOdds,
  type RawOddsEvent,
} from "@/types/nba";

export class LiveOddsProvider implements OddsProvider {
  private async fetchJson<T>(url: string): Promise<T> {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Live odds request failed with status ${response.status}.`);
    }

    return (await response.json()) as T;
  }

  private buildFeaturedUrl(): string {
    const { config } = getLiveOddsConfig();
    const query = new URLSearchParams({
      regions: config.regions,
      markets: config.featuredMarkets,
      oddsFormat: "american",
      apiKey: config.apiKey,
    });

    if (config.bookmakers) {
      query.set("bookmakers", config.bookmakers);
    }

    return `${config.baseUrl}/sports/${config.sportKey}/odds?${query.toString()}`;
  }

  private buildEventOddsUrl(eventId: string): string {
    const { config } = getLiveOddsConfig();
    const query = new URLSearchParams({
      regions: config.regions,
      markets: config.propMarkets.join(","),
      oddsFormat: "american",
      apiKey: config.apiKey,
    });

    if (config.bookmakers) {
      query.set("bookmakers", config.bookmakers);
    }

    return `${config.baseUrl}/sports/${config.sportKey}/events/${eventId}/odds?${query.toString()}`;
  }

  private getPreferredBookmakers(): string[] {
    const { config } = getLiveOddsConfig();

    return config.bookmakers
      ? config.bookmakers
          .split(",")
          .map((entry) => entry.trim())
          .filter(Boolean)
      : [];
  }

  private async loadBaseContext() {
    const provider = getDataProvider();
    const [teams, players, games] = await Promise.all([
      provider.getTeams(),
      provider.getPlayers(),
      provider.getGames(),
    ]);

    return { teams, players, games };
  }

  async getPlayerPropFeed(): Promise<PlayerPropFeed> {
    const { valid, warnings } = getLiveOddsConfig();

    if (!valid) {
      return {
        fetchMeta: createOddsFetchMeta({
          source: "live",
          fallbackUsed: false,
          warnings,
        }),
        events: [],
        matchedEvents: [],
        warnings,
      };
    }

    try {
      const context = await this.loadBaseContext();
      const featuredEvents = await this.fetchJson<RawOddsEvent[]>(this.buildFeaturedUrl());
      const featuredMeta = createOddsFetchMeta({
        source: "live",
        fallbackUsed: false,
      });
      const { matchedEvents } = normalizeFeaturedGameOdds(featuredEvents, {
        teams: context.teams,
        games: context.games,
        fetchMeta: featuredMeta,
        preferredBookmakers: this.getPreferredBookmakers(),
      });

      if (matchedEvents.length === 0) {
        const noMatchWarnings = [
          "Live props are available from the provider, but no events matched the current NBA slate.",
        ];

        return {
          fetchMeta: createOddsFetchMeta({
            source: "live",
            fallbackUsed: false,
            warnings: noMatchWarnings,
          }),
          events: [],
          matchedEvents: [],
          warnings: noMatchWarnings,
        };
      }

      const rawEventOdds = await Promise.all(
        matchedEvents.map((event) =>
          this.fetchJson<RawOddsEvent>(this.buildEventOddsUrl(event.externalEventId)),
        ),
      );

      return {
        fetchMeta: featuredMeta,
        events: rawEventOdds,
        matchedEvents,
        warnings: [],
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Live player props request failed unexpectedly.";

      return {
        fetchMeta: createOddsFetchMeta({
          source: "live",
          fallbackUsed: false,
          warnings: [message],
        }),
        events: [],
        matchedEvents: [],
        warnings: [message],
      };
    }
  }

  async getGameOdds(): Promise<GameOdds[]> {
    const { valid } = getLiveOddsConfig();

    if (!valid) {
      return [];
    }

    try {
      const context = await this.loadBaseContext();
      const rawEvents = await this.fetchJson<RawOddsEvent[]>(this.buildFeaturedUrl());
      const featuredMeta = createOddsFetchMeta({
        source: "live",
        fallbackUsed: false,
      });
      const { gameOdds } = normalizeFeaturedGameOdds(rawEvents, {
        teams: context.teams,
        games: context.games,
        fetchMeta: featuredMeta,
        preferredBookmakers: this.getPreferredBookmakers(),
      });

      return gameOdds.map((game) => ({
        ...game,
        fetchMeta: createOddsFetchMeta({
          source: "live",
          fallbackUsed: false,
        }),
      }));
    } catch {
      return [];
    }
  }

  async getPlayerPropOdds(): Promise<PlayerPropOdds[]> {
    try {
      const context = await this.loadBaseContext();
      const feed = await this.getPlayerPropFeed();

      if (feed.events.length === 0) {
        return [];
      }

      const { offers } = normalizePlayerPropOffers({
        feed,
        teams: context.teams,
        games: context.games,
        players: context.players,
      });

      return withPlayerPropOddsMeta(toLegacyPlayerPropOdds(offers), feed.fetchMeta);
    } catch {
      return [];
    }
  }
}
