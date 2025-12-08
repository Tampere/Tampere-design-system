import { useState, useRef } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  within,
  userEvent,
  waitFor,
  waitForElementToBeRemoved,
  screen,
} from '@storybook/testing-library';
import { expect, fn } from 'storybook/test';

import { SearchField, SearchFieldData } from './SearchField';

const meta: Meta<typeof SearchField> = {
  argTypes: {
    data: { control: 'object' },
    onSearch: { action: 'searched' },
    onChange: { action: 'changed' },

    inputLabel: { control: 'text', description: 'Input label (visible)' },
    placeholder: { control: 'text', description: 'Placeholder text' },
    helperText: { control: 'text', description: 'Helper/description text' },
    error: { control: 'text', description: 'Error text (shows error state)' },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
    showSearchIcon: { control: 'boolean', description: 'Show left search icon' },
    showClearButton: { control: 'boolean', description: 'Show clear button when non-empty' },
    clearButtonLabel: { control: 'text', description: 'aria-label for clear button' },
  },
  args: {
    data: [],
    inputLabel: 'Search',
    placeholder: '',
    helperText: '',
    error: '',
    disabled: false,
    required: false,
    showSearchIcon: false,
    showClearButton: false,
    clearButtonLabel: 'Clear',
  },
  component: SearchField,
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * A basic story demonstrating the SearchField component with static data.
 */
export const Primary: Story = {
  args: {
    inputLabel: 'Osoite, kiinteistö-, lupa- tai rakennustunnus',
    data: [
      { value: 'pellavatehtaankatu', label: 'Pellavatehtaankatu' },
      { value: 'pirkankatu', label: 'Pirkankatu' },
      { value: 'pispalan-valtatie', label: 'Pispalan valtatie' },
      { value: 'paatie', label: 'Päätie' },
      { value: 'pohjolankatu', label: 'Pohjolankatu' },
      { value: 'puuvillatehtaankatu', label: 'Puuvillatehtaankatu' },
      { value: 'puutarhakatu', label: 'Puutarhakatu' },
      { value: 'pellervonkatu', label: 'Pellervonkatu' },
      { value: 'pappilankatu', label: 'Pappilankatu' },
      { value: 'peltokatu', label: 'Peltokatu' },
    ],
    clearButtonLabel: 'Clear',
    onSearch: () => {},
    onChange: () => {},
  },
  render: (args) => <SearchField {...args} />,
};

/**
 * Types for GitHub API responses
 */
interface GithubUser {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
}

interface GithubRepo {
  id: number;
  full_name: string;
  html_url: string;
  owner: {
    login: string;
  };
}

interface GithubUserSearchResponse {
  total_count: number;
  incomplete_results: boolean;
  items: GithubUser[];
}

interface GithubRepoSearchResponse {
  total_count: number;
  incomplete_results: boolean;
  items: GithubRepo[];
}

interface SearchResult extends SearchFieldData {
  type: 'user' | 'repo' | 'error' | 'noResults';
  data: GithubUser | GithubRepo;
}

/**
 * A story demonstrating searching GitHub users and repositories.
 */
export const GithubSearch: Story = {
  args: {
    inputLabel: 'Search GitHub Users and Repositories',
    placeholder: 'Type at least 3 characters to search...',
    clearButtonLabel: 'Clear',
  },
  render: (args) => {
    const [searchData, setData] = useState<SearchResult[]>([]);
    const [isLoading, setLoading] = useState(false);
    const [error, setError] = useState<string | undefined>(undefined);

    const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    const fetchGithubData = async (query: string) => {
      const userUrl = `https://api.github.com/search/users?q=${encodeURIComponent(query)}+in:login`;
      const repoUrl = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}+in:name`;

      const [userRes, repoRes] = await Promise.all([fetch(userUrl), fetch(repoUrl)]);

      if (!userRes.ok || !repoRes.ok) {
        const message =
          userRes.status === 403 || repoRes.status === 403
            ? 'GitHub rate limit exceeded. Try again in 30 seconds.'
            : 'GitHub returned an error. Try again in 30 seconds.';
        // Set error state to display in TextField error message
        setError(message);

        // Return an error item to display in the dropdown
        return [
          {
            type: 'error',
            value: 'error',
            label: message,
            data: {},
          } as SearchResult,
        ];
      } else {
        // Clear any previous error
        setError(undefined);
      }

      const [usersData, reposData]: [GithubUserSearchResponse, GithubRepoSearchResponse] =
        await Promise.all([userRes.json(), repoRes.json()]);

      const userResults = usersData.items.map((item) => ({
        type: 'user',
        value: item.login,
        label: item.login,
        data: item,
      })) as SearchResult[];

      const repoResults = reposData.items.map((item) => ({
        type: 'repo',
        value: item.full_name,
        label: item.full_name,
        data: item,
      })) as SearchResult[];

      // Combine user and repo results
      const searhchResults: SearchResult[] = [...userResults, ...repoResults];

      // Sort results alphabetically and limit to 50 items
      // If no results, return a "No results found" item
      return searhchResults.length > 0
        ? searhchResults.sort((a, b) => a.label.localeCompare(b.label)).slice(0, 50)
        : [
            {
              type: 'noResults',
              value: 'noResults',
              label: 'No results found',
              data: {},
            } as SearchResult,
          ];
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement> | undefined) => {
      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current);
      }

      const value = event?.target?.value || '';

      if (value.length < 3) {
        setData([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      typingTimeout.current = setTimeout(() => {
        fetchGithubData(value)
          .then(setData)
          .finally(() => setLoading(false));
      }, 300);
    };

    const onSearch = (value: SearchResult) => {
      // Open the selected GitHub user or repository in a new tab
      window.open(value.data.html_url, '_blank');
    };

    return (
      <SearchField
        {...args}
        searchOnItemSelect
        data={searchData}
        onChange={handleChange}
        onSearch={(value) => onSearch(value)}
        onClearClick={() => setData([])}
        isLoading={isLoading}
        error={error}
        searchButtonProps={{
          'aria-label': 'Search GitHub users and repositories',
        }}
      />
    );
  },
};

export const ShowsLoadingAfterThreeChars: Story = {
  ...GithubSearch,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');

    await userEvent.type(input, 'Tam');
    await expect(screen.queryByRole('progressbar')).toBeInTheDocument();
    await waitFor(() => {
      waitForElementToBeRemoved(screen.queryByRole('progressbar'), { timeout: 4000 });
    });
  },
};

export const NoLoadingWithTwoChars: Story = {
  ...GithubSearch,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');

    await userEvent.type(input, 'Ta');
    await expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  },
};

export const ShowsSearchResult: Story = {
  ...GithubSearch,

  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');

    await userEvent.type(input, 'Tampere/design');
    await waitFor(() => {
      expect(
        screen.getByRole('option', { name: 'Tampere/Tampere-design-system' })
      ).toBeInTheDocument();
    });
  },
};

export const OpensItemOnSelect: Story = {
  ...GithubSearch,

  play: async ({ canvasElement }) => {
    window.open = fn();
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');

    await userEvent.type(input, 'Tampere/design');
    await waitFor(() => {
      expect(
        screen.getByRole('option', { name: 'Tampere/Tampere-design-system' })
      ).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText('Tampere/Tampere-design-system'));

    expect(window.open).toHaveBeenCalled();
  },
};

export const OpensItemOnEnter: Story = {
  ...GithubSearch,

  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');

    await userEvent.type(input, 'Tampere/design');
    await waitFor(() => {
      expect(
        screen.getByRole('option', { name: 'Tampere/Tampere-design-system' })
      ).toBeInTheDocument();
    });

    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(window.open).toHaveBeenCalled();
  },
};

export const ClearInput: Story = {
  ...GithubSearch,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');

    await userEvent.type(input, 'Ta');

    await expect(canvas.getByRole('button', { name: 'Clear' })).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Clear' }));
    await expect(input).toHaveValue('');
  },
};
