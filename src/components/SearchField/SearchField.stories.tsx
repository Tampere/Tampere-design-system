import { useState, useRef } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SearchField, SearchFieldData } from './SearchField';

const meta: Meta<typeof SearchField> = {
  argTypes: {
    inputLabel: { control: 'text' },
    data: { control: 'object' },
    searchButtonLabel: { control: 'text' },
    clearButtonLabel: { control: 'text' },
    onSearch: { action: 'searched' },
    onChange: { action: 'changed' },
  },
  args: {
    inputLabel: 'Search',
    data: [],
    searchButtonLabel: 'Search',
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
    searchButtonLabel: 'Search button',
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
  type: 'user' | 'repo';
  data: GithubUser | GithubRepo;
}

/**
 * A story demonstrating searching GitHub users and repositories.
 */
export const GithubSearch: Story = {
  args: {
    inputLabel: 'Search GitHub Users and Repositories',
    placeholder: 'Type at least 3 characters to search...',
    searchButtonLabel: 'Search button',
    clearButtonLabel: 'Clear',
  },
  render: (args) => {
    const [searchData, setData] = useState<SearchResult[]>([]);
    const [isLoading, setLoading] = useState(false);

    const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    const fetchGithubData = async (query: string) => {
      const userUrl = `https://api.github.com/search/users?q=${encodeURIComponent(query)}+in:login`;
      const repoUrl = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}+in:name`;

      const [userRes, repoRes] = await Promise.all([fetch(userUrl), fetch(repoUrl)]);

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

      /**
       * Combine and sort results by label, limit to 50 results
       */
      return [...userResults, ...repoResults]
        .sort((a, b) => a.label.localeCompare(b.label))
        .slice(0, 50);
    };

    const handleChange = (value: string) => {
      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current);
      }

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
      }, 400);
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
      />
    );
  },
};
