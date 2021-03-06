import React from 'react';
import { compoundExpand } from '@patternfly/react-table';
import { ScreenIcon, RepositoryIcon, ContainerNodeIcon } from '@patternfly/react-icons';
import { translate as __ } from 'foremanReact/common/I18n';

import IconWithCount from '../components/IconWithCount';
import DetailsExpansion from '../expansions/DetailsExpansion';
import RepositoriesExpansion from '../expansions/RepositoriesExpansion';
import EnvironmentsExpansion from '../expansions/EnvironmentsExpansion';
import VersionsExpansion from '../expansions/VersionsExpansion';
import ContentViewName from '../components/ContentViewName';
import DetailsContainer from '../details/DetailsContainer';

export const buildColumns = () => [
  __('Name'), __('Last published'), __('Details'),
  { title: __('Environments'), cellTransforms: [compoundExpand] },
  { title: __('Repositories'), cellTransforms: [compoundExpand] },
  { title: __('Versions'), cellTransforms: [compoundExpand] },
];

const buildRow = (contentView, openColumn) => {
  const {
    id, composite, name, environments, repositories, versions, last_published: lastPublished,
  } = contentView;
  const row = [
    { title: <ContentViewName composite={composite ? true : undefined} name={name} cvId={id} /> },
    lastPublished || 'Not yet published',
    { title: __('Details'), props: { isOpen: false, ariaControls: `cv-details-expansion-${id}` } },
    {
      title: <IconWithCount Icon={ScreenIcon} count={environments.length} title={`environments-icon-${id}`} />,
      props: { isOpen: false, ariaControls: `cv-environments-expansion-${id}` },
    },
    {
      title: <IconWithCount Icon={RepositoryIcon} count={repositories.length} title={`repositories-icon-${id}`} />,
      props: { isOpen: false, ariaControls: `cv-repositories-expansion-${id}` },
    },
    {
      title: <IconWithCount Icon={ContainerNodeIcon} count={versions.length} title={`versions-icon-${id}`} />,
      props: { isOpen: false, ariaControls: `cv-versions-expansion-${id}` },
    },
  ];
  if (openColumn) row[openColumn].props.isOpen = true;

  return row;
};

const buildDetailDropdowns = (id, rowIndex, openColumn) => {
  const cvId = { cvId: id };
  const expansionProps = { ...cvId, className: 'pf-m-no-padding' };
  const containerProps = column => ({ ...cvId, isOpen: openColumn === column });

  let detailDropdowns = [
    {
      compoundParent: 2,
      cells: [
        {
          title: (
            <DetailsContainer {...containerProps(3)}>
              <DetailsExpansion {...expansionProps} />
            </DetailsContainer>),
          props: { colSpan: 6 },
        },
      ],
    },
    {
      compoundParent: 3,
      cells: [
        {
          title: (
            <DetailsContainer {...containerProps(4)}>
              <EnvironmentsExpansion {...expansionProps} />
            </DetailsContainer>),
          props: { colSpan: 6 },
        },
      ],
    },
    {
      compoundParent: 4,
      cells: [
        {
          title: (
            <DetailsContainer {...containerProps(5)}>
              <RepositoriesExpansion {...expansionProps} />
            </DetailsContainer>),
          props: { colSpan: 6 },
        },
      ],
    },
    {
      compoundParent: 5,
      cells: [
        {
          title: (
            <DetailsContainer {...containerProps(6)}>
              <VersionsExpansion {...expansionProps} />
            </DetailsContainer>),
          props: { colSpan: 6 },
        },
      ],
    },
  ];

  // The rows are indexed along with the hidden dropdown rows, so we need to offset the parent row
  const rowOffset = detailDropdowns.length + 1;
  detailDropdowns = detailDropdowns.map(detail => ({ ...detail, parent: rowIndex * rowOffset }));

  return detailDropdowns;
};

const tableDataGenerator = (results, rowMapping) => {
  const updatedRowMapping = { ...rowMapping };
  const contentViews = results || [];
  const columns = buildColumns();
  const rows = [];

  contentViews.forEach((contentView, rowIndex) => {
    const { id } = contentView;
    // hasOwnProperty syntax because of https://eslint.org/docs/rules/no-prototype-builtins
    if (!Object.prototype.hasOwnProperty.call(updatedRowMapping, id)) {
      updatedRowMapping[id] = { expandedColumn: null, rowIndex: rows.length };
    }
    const openColumn = updatedRowMapping[id].expandedColumn;
    const cells = buildRow(contentView, openColumn);
    const isOpen = !!openColumn;

    rows.push({ isOpen, cells });
    rows.push(...buildDetailDropdowns(id, rowIndex, openColumn));
  });

  return { updatedRowMapping, rows, columns };
};

export default tableDataGenerator;
