import React from "react"
import { Theme, styled } from '@mui/material/styles';
// import PropTypes from 'prop-types';
import {
    TableCell
} from "@mui/material";
import { AutoSizer, Column, InfiniteLoader, Table } from "react-virtualized"

import "./VirtualTable.css"

const classes = {
    flexContainer: 'ReactVirtualizedDemo-flexContainer',
    tableRow: 'ReactVirtualizedDemo-tableRow',
    tableRowHover: 'ReactVirtualizedDemo-tableRowHover',
    tableCell: 'ReactVirtualizedDemo-tableCell',
    noClick: 'ReactVirtualizedDemo-noClick',
    tableCellLib: 'MuiTableCell-root',
};


const styles = ({ theme }) =>
({
    // temporary right-to-left patch, waiting for
    // https://github.com/bvaughn/react-virtualized/issues/454
    '& .ReactVirtualized__Table__headerRow': {
        ...(theme.direction === 'rtl' && {
            paddingLeft: '0 !important',
        }),
        ...(theme.direction !== 'rtl' && {
            paddingRight: undefined,
        }),
    },
    [`& .${classes.flexContainer}`]: {
        display: 'flex',
        alignItems: 'center',
        boxSizing: 'border-box',
    },
    [`& .${classes.tableRow}`]: {
        cursor: 'pointer',
    },
    [`& .${classes.tableRowHover}`]: {
        '&:hover': {
            backgroundColor: theme.palette.grey[200],
        },
    },
    [`& .${classes.tableCell}`]: {
        flex: 1,
    },
    [`& .${classes.noClick}`]: {
        cursor: 'initial',
    },
    [`& .${classes.tableCellLib}`]: {
        background: '100%',
    },
});

class VirtualTable extends React.Component {
    getRowClassName = () => {
        return `${classes.tableRow} ${classes.flexContainer}`;
    };

    headerRenderer = (data) => {
        const {
            label,
            headerHeight,
            headerCellRenderer: customCellRenderer
        } = data;

        if (customCellRenderer instanceof Function) {
            return customCellRenderer(data);
        }

        return (
            <TableCell
                component="div"
                variant="head"
                style={{ height: headerHeight }}
                className={`${classes.tableCell} ${classes.flexContainer} ${classes.noClick}`}
            >
                <span>{label}</span>
            </TableCell>
        );
    }

    cellRenderer = (data) => {
        const {
            cellData,
            columnIndex,
            rowHeight
        } = data;
        const { columns } = this.props;
        const columnDetails = columns[columnIndex];
        const customCellRenderer = columnDetails.cellRenderer;

        if (customCellRenderer instanceof Function) {
            return customCellRenderer(data);
        }

        return (
            <TableCell
                component="div"
                variant="body"
                style={{ height: rowHeight }}
                className={`${classes.tableCell} ${classes.flexContainer} `}
            >
                {cellData}
            </TableCell>
        );
    }


    render() {
        const { data, totalDataCount, onRequestMoreData, columns, rowHeight } = this.props;

        return (
            <InfiniteLoader
                isRowLoaded={({ index }) => !!data[index]}
                loadMoreRows={onRequestMoreData}
                rowCount={totalDataCount}
            >
                {({ onRowsRendered, registerChild }) => (
                    <AutoSizer>
                        {({ width, height }) => (
                            <Table
                                ref={registerChild}
                                rowClassName={this.getRowClassName}
                                rowStyle={{ display: 'flex', }}
                                onRowsRendered={onRowsRendered}
                                headerHeight={rowHeight}
                                width={width}
                                height={height}
                                rowHeight={rowHeight}
                                rowCount={data.length}
                                rowGetter={({ index }) => data[index]}
                            >
                                {
                                    columns.map((column, i) => {
                                        const columnWidth = column.width instanceof Function ? column.width({ tableWidth: width }) : column.width;

                                        return (
                                            <Column
                                                {...column}
                                                key={i}
                                                // label={translate('product_name')}
                                                // dataKey='id'
                                                // width={width * 0.2}
                                                // width={200}
                                                flexGrow={1}
                                                width={columnWidth}
                                                headerRenderer={(data) => this.headerRenderer({ ...data, ...column })}
                                                cellRenderer={this.cellRenderer}
                                            />
                                        )

                                    })
                                }
                            </Table>
                        )}
                    </AutoSizer>
                )}
            </InfiniteLoader>
        )
    }
}


// CatalogProductsTableAction.propTypes = {
//     data: PropTypes.arrayOf,
//     onRequestMoreData: PropTypes.func.isRequired,
//     rowDataAvailabilityChecker: PropTypes.func.isRequired,
// };

export default styled(VirtualTable)(styles)
