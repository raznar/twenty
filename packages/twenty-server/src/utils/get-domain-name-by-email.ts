import { msg } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';

import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

const getEmailDomainSeparatorIndexes = (email: string) => {
  const separatorIndexes: number[] = [];
  let isInsideQuotedLocalPart = false;

  for (
    let characterIndex = 0;
    characterIndex < email.length;
    characterIndex++
  ) {
    const character = email[characterIndex];

    if (character === '"' && separatorIndexes.length === 0) {
      isInsideQuotedLocalPart = !isInsideQuotedLocalPart;
    }

    if (character === '@' && !isInsideQuotedLocalPart) {
      separatorIndexes.push(characterIndex);
    }
  }

  return separatorIndexes;
};

export const getDomainNameByEmail = (email: string) => {
  if (!isNonEmptyString(email)) {
    throw new UserInputError(
      'Email is required. Please provide a valid email address.',
      {
        userFriendlyMessage: msg`Email is required. Please provide a valid email address.`,
      },
    );
  }

  const domainSeparatorIndexes = getEmailDomainSeparatorIndexes(email);

  if (domainSeparatorIndexes.length !== 1) {
    throw new UserInputError(
      'The provided email address is not valid. Please use a standard email format (e.g., user@example.com).',
      {
        userFriendlyMessage: msg`The provided email address is not valid. Please use a standard email format (e.g., user@example.com).`,
      },
    );
  }

  const domain = email.slice(domainSeparatorIndexes[0] + 1);

  if (!domain) {
    throw new UserInputError(
      'The provided email address is missing a domain. Please use a standard email format (e.g., user@example.com).',
      {
        userFriendlyMessage: msg`The provided email address is missing a domain. Please use a standard email format (e.g., user@example.com).`,
      },
    );
  }

  return domain;
};
